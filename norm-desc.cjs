const fs = require('fs');
const { Database } = require('sqlite3');
const { promisify } = require('util');

const TITLES = [
  'Organic Tomatoes', 'Fresh Strawberries', 'Premium Rice', 'Fresh Milk',
  'Grass-Fed Eggs', 'Green Spinach', 'Banana Bunch', 'Organic Fertilizer'
];

function normalize(text) {
  const paras = text.split(/\n\s*\n/).filter((p) => p.trim() !== '');
  // merge last two paragraphs until within 3-5
  while (paras.length > 5) {
    const last = paras.pop();
    const prev = paras.pop();
    paras.push(prev.trim() + ' ' + last.trim());
  }
  return paras.join('\n\n');
}

function rewriteFile(path, titleMap) {
  let src = fs.readFileSync(path, 'utf8');
  let changed = 0;
  for (const [title, norm] of titleMap) {
    const open = `[\'${title}\', \``;
    const start = src.indexOf(open);
    if (start === -1) continue;
    const end = src.indexOf('`,', start);
    const raw = src.slice(start + open.length, end);
    const curParas = raw.split(/\n\s*\n/).filter((p) => p.trim() !== '');
    if (curParas.length > 5) {
      src = src.slice(0, start + open.length) + norm + src.slice(end);
      changed++;
    }
  }
  fs.writeFileSync(path, src);
  return changed;
}

(async () => {
  // 1) Read current descriptions from the DB (source of truth for runtime)
  const db = new Database('farmer_marketplace.db');
  const getAll = promisify(db.all).bind(db);
  const run = promisify(db.run).bind(db);
  const rows = await getAll(`SELECT id, title, description FROM products`);
  db.close();

  const normMap = new Map();
  for (const r of rows) {
    const norm = normalize(r.description);
    normMap.set(r.title, norm);
  }

  // report
  for (const [t, n] of normMap) {
    const paras = n.split(/\n\s*\n/).length;
    const words = n.trim().split(/\s+/).length;
    const unit = (n.match(/(\d+\s*(kg|g|L|pcs|tray))\s*$/i) || [])[1];
    console.log(t.padEnd(20), 'paras', paras, 'words', words, 'unit', unit, paras >= 3 && paras <= 5 && words >= 500 ? 'OK' : 'BAD');
  }

  // 2) Write normalized descriptions back into the DB
  const db2 = new Database('farmer_marketplace.db');
  const run2 = promisify(db2.run).bind(db2);
  const close2 = promisify(db2.close).bind(db2);
  for (const r of rows) {
    await run2(`UPDATE products SET description = ? WHERE id = ?`, [normMap.get(r.title), r.id]);
  }
  await close2();
  console.log('DB updated');

  // 3) Sync both source files
  for (const f of ['server/seed.js', 'server/index.js']) {
    const c = rewriteFile(f, normMap);
    console.log(f, 'changed demos:', c);
  }
})();