import express from 'express';
import cors from 'cors';
import pkg from 'sqlite3';
const { verbose: sqlite3Verbose, Database } = pkg;
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = new Database(process.env.DB_PATH || 'farmer_marketplace.db');

// Initialize DB
function initDB() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('seller','buyer')) DEFAULT 'buyer'
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      imageUrl TEXT,
      category TEXT NOT NULL DEFAULT 'general',
      wholesale INTEGER NOT NULL DEFAULT 0,
      sellerId INTEGER REFERENCES users(id) ON DELETE CASCADE
    )`);
    db.all(`PRAGMA table_info(products)`, (_err, rows) => {
      const cols = (rows || []).map((c) => c.name);
      if (!cols.includes('category')) {
        db.run(`ALTER TABLE products ADD COLUMN category TEXT NOT NULL DEFAULT 'general'`);
      }
      if (!cols.includes('wholesale')) {
        db.run(`ALTER TABLE products ADD COLUMN wholesale INTEGER NOT NULL DEFAULT 0`);
      }
    });
    db.get(`SELECT COUNT(*) AS cnt FROM users`, (err, row) => {
      if (err) return;
      if (row.cnt === 0) {
        db.run(`INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)`, 
        ['Demo Seller', 'seller@example.com', 'demo123', 'seller']);
      }
    });
    db.get(`SELECT COUNT(*) AS cnt FROM products`, (err, row) => {
      if (err) return;
      if (row.cnt === 0) {
        seedProducts();
      }
    });
  });
}

function seedProducts() {
const demos = [
    ['Organic Tomatoes', `The tomatoes on this stall are not grown six hundred miles away and kept in cool storage. They are picked before the sun hits the glasshouse and they arrive on your doorstep the same morning. That is the difference you cannot fake in a photograph, and it is the difference you will taste in the first slice.

Every tray is a single variety, chosen because it ripens on the vine instead of being gassed to colour. The result is a fruit that smells like summer when you lift the lid: a faint sweetness over a proper tatty tomato leaf. Heirloom strains ripen at slightly different speeds, so you will find fruits at more than one stage of redness in the same tray. That is not a defect. That is the point. Perfectly uniform red is what the cooling warehouse gives you, and it is never quite as good as it looks.

The tomatoes are grown two kilometres from the pack shed using drip irrigation and compost made from the farm's own straw. No broadacre spraying, no blanket fertiliser. Each plant is walked and hand-checked every other day during the season. We want the tray on your counter within a day of cutting, because a field-ripened tomato does not hold. It improves for a few hours after cutting and then it turns. Order in the morning and it really is morning-picked.

Use them raw in a bowl with sea salt and torn basil within a day of delivery, or roast a few wedges with olive oil and garlic for a side that takes ten minutes. They keep best at room temperature, stem side down, never in the fridge. If a few soft ones appear, those are the ones to cook first, not throw away — they make the best quick pasta sauce, roughly chopped into a pan with a clove of garlic and a little olive oil. We pick to your order, the crate is tied with twine, and the price you pay is the same price the stall charges, with no middle mark-up.

This is the tomato the stall grew up famous for. Neighbours used to laugh when the first trays went to the gate, but now the stall gets asked to hold extra trays before the weekend, and regulars put their name down two days ahead so the picker knows how many to cut. The tomatoes are a blend of two local heirlooms, a ribbed Italian type and a small round Balinese one, which is why you get shapes and thicknesses of skin in the same tray. The Italian ones have more juice and the Balinese ones carry a deeper sweetness, so the pairing works in a salad where you want both snap and a long, rich finish. The farm has been saving seed from the best fruit each year for nearly a decade, and that is why the flavour has grown steadier season after season; a saved-seed crop is a crop bred in one place by one set of hands. If you want to see how fresh these are, look at the stem. It will be a little green and still slightly damp at the point where it was cut, which a warehouse tomato never shows because it is snapped off weeks earlier. That moisture is the plant still feeding the fruit, and it is the reason these keep their structure when you slice them thick. Do not refrigerate them and do not store them in a closed plastic bag; the cold kills the aroma and the trapped dampness speeds up the softening at the bruise points. A shaded spot in the kitchen, one layer deep in a shallow bowl with the stems up, is the best you can give them. We pack them that way on purpose, loosely, so they travel home intact rather than pre-crushed by their own weight. 1 kg`, 25000, 'https://dummyimage.com/400x300/3E6B4F/FBF8F1&text=Tomatoes', 'vegetables', 1],
    ['Fresh Strawberries', `The strawberry season in this valley is short, and that is exactly why they are worth buying now. Grown in raised soil beds rather than hydroponic trays, the berries are pollinated by bees that live on the farm, not by a hive imported for the month. You can taste the difference in the depth of the flavour: real strawberries have a jammy core, not just sweet water on the outside.

Each one is cut by hand with a short snips, leaving the green calyx attached so the berry holds its juice. They are picked on cool mornings and packed into shallow crates within an hour, never stacked deep and crushed at the bottom of a bulk bin. The crates are kept out of the sun and onto the van immediately. Strawberries are the hardest fruit to get from field to fridge before they turn to mush, and the reason ours arrive firm is the same reason they cost a little more: they were picked for you, not for a warehouse.

The variety this season is a mid-season day-neutral that keeps fruiting from spring to the first frost, which is unusual and worth writing down. It is not the biggest berry you will ever see, but it has the highest sugar reading we have recorded on the brix scale all year. The colour is a deep, almost purple red rather than a bright supermarket shine. That depth of colour is a natural sign of ripeness, and it means the second you bite through the skin the berry gives slightly, then a wave of flavour rather than a burst of juice that never quite satisfies. Eat them that evening for the best sweetness and texture.

These are beautiful simply washed and left in a bowl on the table, sprinkled with a little lime, or folded into plain yoghurt after dinner. If you have a basketful left by the weekend, turn them into a crumble and serve it still warm, or slice them into a salad with cucumber, mint and a sharp cheese. They will not keep more than two or three days even in the fridge, so plan for that volume of berry. For resellers and bakeries the wholesale option is available in 250 g crates, cut the same morning and packed to your spec.

A word on the picking: the farm has a rule that a berry must lift off the plant with the calyx attached and no white shoulders. Anything with a pale patch at the top is put back on the bed to ripen for tomorrow, which is one of the few things that costs money in this business and we happily pay for it. You might wonder how we can afford that when the wholesale rate punishes any wasted fruit. The answer is simple: the fruit that does not meet the cut sells at a lower spot price to the jam factory, so it still earns its keep, and the best berries go to the stall. That system means the farm never panics and picks under-ripe, and it means when we say fresh here, we mean the fruit that was good enough to sell at the stall, not the runt of the field. For storage, keep them in the shallow crate the stall supplies, unwashed, in the crisper drawer. Wash only what you plan to eat in the sitting. If you do end up with a few extra on Sunday, crush them into a jar with a little sugar and let it sit for the best compote you have had; two hours is honestly enough. The flavour holds in that syrup better than the fruit holds raw after three days, so there is no wrong way to eat these. 250 g`, 50000, 'https://dummyimage.com/400x300/3E6B4F/FBF8F1&text=Strawberries', 'fruits', 1],
    ['Premium Rice', `The rice is milled from the whole kernel, which is why a 5 kg sack of it cooks into far more than five kilos of finished meal. We do not polish off the outer layers for the sake of a whiter grain, because most of the flavour and a good deal of the nutrition lives in that husk. What you get is a long-grain, aromatic rice that swells and separates on the fork instead of collapsing into a sticky mass.

It is grown on small family plots in the volcanic soils around the north coast district, where the day-and-night range does the final magic on the crop. The paddy is harvested with a small combine, then dried in the sun on concrete slabs for several days until the moisture is low enough to mill. It is never parboiled. The mill is a family business three valleys away, and it runs the grain through a gentle husking rather than a heavy, hot process. That care shows up as a faint nuttiness and a clean, floral smell when the grains hit the pan.

Because the rice keeps its outer layers the cooking time is a touch longer than the over-processed supermarket bags, and it appreciates a rinse and a twenty-minute soak before you cook it. Use about one part rice to two parts water, bring it to the boil, then lower the heat and cover for twelve minutes. Let it rest, covered and off the heat, for five minutes more before you fork it open. If you skip the rest it releases starch and goes clumpy. Each grain separates and the pot is dry underneath, which is the traditional test we learned from the farmers who have milled this way for three generations.

Serve it with a vegetable curry, steamed fish, or a fried-egg dish for dinner. It also works beautifully cold in a next-day fried rice, where the dry, day-old grains take on soy and egg without breaking apart. This is a whole family bag rather than a single dinner portion, and it keeps in a sealed container for a full year in a cool, dark pantry. Buy it once and use it slowly; the flavour builds over a bowl or two. 5 kg

A note for the pantry: buy the bag while it is current season is the best time to stock up. The dry paddy is stable for a full twelve months in a sealed container, and it actually improves a little as it settles; the sharp edge of fresh-stored starch rounds out after the first few weeks of resting. Keep the sack sealed and cool and dark, and the grain will hold its fragrance and its clean taste. This is the sort of purchase that gets made once a year alongside the other staples, and it quietly makes every meal between now and the next purchase a little better. For anyone who cooks rice for a family table several times a week, this is the difference between the weeknight bowl and the one worth lingering over. 5 kg`, 15000, 'https://dummyimage.com/400x300/3E6B4F/FBF8F1&text=Rice', 'grains', 0],
    ['Fresh Milk', `The milk on the shelf at the back is delivered whole, the same morning it was drawn, and it is not homogenised, so you may notice a thin layer of cream rising on the top of the bottle. That separation is the sign of milk that has not been passed through a high-pressure machine dozens of times before bottling. It is the texture and flavour of unprocessed milk; it is what coffee shops in the city pay three times this price to source for their flat whites.

The herd is a small group of Jersey cows, picked because their milk carries more cream and flavour than the higher-yielding black and white breeds. They graze on clover and grass through the pasture months, with a modest supplement of farm-grown hay through the winter. Nothing is pushed to raise milk volume. The cows are milked once in the quiet of the early morning by the same two people who muck the yard and feed the calves. That continuity, a cow handled by the same hands, makes a measurable difference in both the yield of a settled animal and the stress of the herd.

The milk comes to us twice a week, cooled, and is skimmed only at the edge for the half-litres when there is a demand. What you buy here is essentially straight from the churn: lightly filtered, lightly pasteurised to keep it safe for children and the elderly, and bottled the same day it arrives. It stands up to heating, frothing for coffee, and baking far better than shelf-stable UHT cartons, because the proteins and fats are intact. It will sour naturally and gently over a week in the fridge, which is the honest sign it is alive.

A carton lasts most households three to four days. Use it for breakfast on porridge, for afternoon puddings, or as the base for a rich homemade yoghurt that the kids will actually eat. It is the kind of milk that transforms the simplest recipes, and it is sold in 1 L packs here instead of the larger, fast-turn sizes that pass for fresh at the supermarket. Bring a jug or a clean bottle if you want the crate-style refills.

This milk has the habit of changing when you heat it, in a good way; the cream rises into a layer you can spoon straight onto porridge, and the heated milk develops a gentle sweetness that plain boiling water and sugar cannot imitate. Baristas in the city quietly buy this brand in bulk because it froths with a body that the ultra-heat-pasteurized cartons foam out of. The fat carries the flavour, and the flavour carries into whatever you do with it, which is the whole reason it costs more. That said, it is honest value because nothing is wasted and nothing is hidden in it. For storage, keep it at the middle of the fridge, away from the door, and use the date on the cap as a guide rather than a deadline. After a week or so it will still be safe, but the gentle fresh tang is at its peak in the first three days. If you are tempted to buy more than your week at a time, freeze the extra in ice trays for cooking, where it works beautifully in a silky scrambled egg or custard. 1 L`, 18000, 'https://dummyimage.com/400x300/3E6B4F/FBF8F1&text=Milk', 'dairy', 0],
    ['Grass-Fed Eggs', `These are the eggs laid before seven in the morning by hens that actually go outside. They live in a mobile ark that is moved across the pasture every few days, so the lawn they are scratching is a moving target and the insects, clover, and grubs they find in the soil are a genuine part of their diet. That is what produces a yolk so rich and orange it looks artificial, except it is not. The colour comes from the grass and the bugs, and it is the difference you can not get from a hen kept indoors on a single dry mash.

The farmer cracks one open before packing the tray and weighs it against a light for size. Every egg in the tray is the same grade, and the shells are left whole and brushed, not sprayed, because the natural cuticle on the egg is what keeps bacteria out. The yolk is firm and stands up tall when the plate is level, which is the tell that the hen is healthy and eating well. If the egg spreads, the hen is not right, and we send it back to the kitchen for cooking rather than the tray for the shelf.

The pack size is a tray of twelve, which is the honest unit a family uses in a fortnight rather than the industrial thirty that go stale in the fridge. The eggs are packed the same day they are laid, stamped with the date on the side, and cold-shipped to the van immediately. They are not candled hard or soaked in a chlorine bath. The shelf is kept to a sensible rotation: oldest eggs at the front, and we tell you the pack date so you can use them in the right order. For those who bake, the higher carotene in these yolks makes shortbread and custards turn a deep yellow with almost no added colour.

To test freshness at home, drop the egg in a glass of water: if it floats, it is near its end; if it sinks and lies flat, it is that morning's. For breakfast fry or scramble them with just a little butter and salt, and the difference is so obvious the rest of the family will notice without being told. Also excellent for an airy pancake batter or a glossy, pale lemon curd. Pick up your tray at the stall while they are in season.

You will notice these eggs taste different, and it is not subtle. The first one cooked fresh has a firmness, a colour, and a flavour that no caged brown egg ever produces, because the diet of the hen shows up in the egg itself. The forage is mostly clover and white clover and the odd dandelion, and the mineral content of the pasture is what deepens the orange and the custard-like texture of the cooked white. We have had customers come back after buying to tell us that an egg fried in butter, salt and nothing else was the best egg of their adult life, which is a better compliment than any five-star review. If you want the most from them, cook them at room temperature rather than straight from the fridge: the whites hold together better and the yolk sits higher. It is an old country cook's trick and it works every time. For baking, these yolks give cakes and doughs a richness and a colour that the paler eggs in the same supermarket trolley simply cannot match. That is the hidden benefit of buying the good eggs: they make everything else you bake better too. 12 pcs`, 22000, 'https://dummyimage.com/400x300/3E6B4F/FBF8F1&text=Eggs', 'dairy', 1],
    ['Green Spinach', `Baby spinach is a fussy crop that rewards patience and timing, and that is the whole story of why the bunches on the stall look the way they do. Each one is cut, bunch by bunch, with a sharp blade when the leaf is small, round and dark enough. The growers pull the whole rosette on a cool morning, not a machine stripping a long row at the hottest part of the afternoon. The leaves you get are no bigger than the palm of your hand because that is when the flavour is sweetest; once spinach puts its energy into setting seed heads the leaves turn fibrous and bitter, and we would rather not sell that at any price.

The bed is hoed by hand between rows so the delicate root stays intact all the way from the garden to the crate. There is no mechanical harvest here, no leaves torn and bruised at the base, which is why your bunch will stay crisp for days. Spinach is one of the few leafy greens that actually improves with a night in the fridge when loosely wrapped; the cold makes the sugars settle and the leaves turn even more tender. Buy it for the next two or three days, not next Saturday.

These baby spinach leaves cook in a fraction of the time other greens need. They are ready in under a minute dropped into a hot wok or a barely simmering pan, wilting down to less than a quarter of their bought volume. That is normal. One bunch in a pan with a little garlic and olive oil disappears into a side dish between the soup and the main. The flavour is clean and slightly sweet with a faint mineral edge from the soil it grew in, and the bright green holds its colour as long as you do not overcook it. Fresh baby spinach is worth eating the day after purchase, simply wilted.

It is also the only green that freezes without becoming a sad grey mush, though fresh is far better here. Use it for a bright green pasta, a creamy spinach soup, or folded through a rich curry. The bunch is 200 g, and two bunches is a generous serving for a family of four when it wilts. We pick to order, and the crate is tied with twine.

A single bunch cooks far further than you might expect. Those handfuls of leaf disappear into a pan but the greens are dense enough to make a proper serving for one, or a base for a larger dish for two. The leaves stay tender even after wilting, and that is why this crop is so forgiving: it is hard to overcook it into mush the way heartier greens can collapse. If you are in a hurry, toss the whole cleaned bunch into a wok with a splash of sesame oil and a sprinkle of salt for sixty seconds, and you have something that looks and tastes like a cooked green rather than a boiled one. For those who plan to use the whole bunch, the best method is to wilt it in the water it clings to after a quick rinse, so you keep the vitamins that leach out when you boil them separately. One bunch is enough for a generous family side dish, and the flavour is mild enough that it sits happily next to a rich curry or a fried egg. This is the kind of green that disappears quickly at a family dinner, so buying a smaller bunch twice a week is often better than one big one that rests. 200 g`, 12000, 'https://dummyimage.com/400x300/3E6B4F/FBF8F1&text=Spinach', 'vegetables', 0],
    ['Banana Bunch', `This is a cooking banana, and the difference from a dessert banana is written through the whole fruit. Rather than being picked green and trucked, these plantains are allowed to hang on the plant until the skins take on a warm, dappled yellow and the flesh begins to sweeten. The result is a banana that you can actually eat raw and enjoy, with a soft, almost custard texture and a honey flavour that disappears into a caramelised brown when fried. The stall sells them in the two-to-three day window when they are neither green nor over-the-knob brown.

The bunch is cut from the plant with a clean blade low enough that the fruit does not knock against the leaves below and bruise. Every hand is inspected before it is crated, because a single split or black tip in a bunch of otherwise perfect fruit ruins the impression for a buyer who is weighing them in their hand. They are kept out of direct sun during transport and are sold the day they arrive, not held for a discount. The farm has a short season for these and does not sell all year, which is precisely the reason to treat them as a seasonal purchase rather than a staple.

Plantain can be eaten every which way. The green ones, firm and starchy, are sliced and fried for chips or cooked into a breakfast hash with a little salt. Those that are turning yellow can be steamed or grilled and served with grilled fish and a squeeze of lime. And the over-ripe black-flecked ones are the sweetest: mashed into pancakes, baked into bread, or fried into little toffee chips that make the best dessert on the stall. That whole lifecycle is why we sell them at this price. You are buying the fruit at the exact moment each stage is at its best.

The bunch you get will be 1 kg, which is usually four to six hands, enough for a family for two or three days. Keep them on the counter in a fruit bowl, away from other ethylene-producing fruit if you want them to last an extra day. Eat the yellow ones first and save the browning for cooking two days later. This is the kind of purchase that turns a plain weeknight meal into something a little bit special, simply by having a piece ready.

One bunch is also a brilliant value purchase because the fruit ripens in stages and you can eat it in more than one form rather than being forced to use it all at once. The green hands fry beautifully with salt and serve with eggs for a breakfast staple, and the yellow ones are sweet and soft enough to eat alone, so a single bunch stretches across several meals and several moods. If you ever have fully brown ones, do not throw them out: mash the softest ones into a banana bread that is moist, deep, and quick to bake, or slice and fry the slightly firmer ones for the best sweet chips on the table. Nothing on this bunch goes to waste, which is exactly the sort of purchase a family kitchen wants. Keep the bunch whole until you need it. Once you break hands off, the cut stem browns and the fruit ripens faster, so break off only what you will use today. If you want the bunch to last to the weekend, wrap the cut end in a strip of beeswax or clingfilm. The stalk will keep the fruit firm enough that even the last banana on the bunch is still good for eating or cooking, not over-ripe. This is a fruit that rewards a little planning and gives you a full range of dishes from one single bunch. 1 kg`, 15000, 'https://dummyimage.com/400x300/3E6B4F/FBF8F1&text=Bananas', 'fruits', 1],
    ['Organic Fertilizer', `Compost is not a single product, and the bag we sell here is not a generic peat substitute. It is the actual compost heap from the stall's own market garden, turned and aerated through the winter months by hand with a fork until the material is dark, crumbly, and smelling of earth rather than rot. We have watched it go from raw kitchen and garden waste through three months of heat to this stable, fine crumb. There is no filler, no moisture-holding crystal, and no chemical accelerant. You are buying the output of a carefully managed pile, and the label states the actual nitrogen, phosphorus and potassium figures from the batch analysis.

The compost is made from straw bedding, legume hulls, and the vegetable trimmings of the stall, layered with green material and cow manure, so the nitrogen-to-carbon balance is right. If you ever see the pile smoke, that is a sign it is too fresh, and we let it cure longer rather than bag it anyway. We bag it in breathable paper at a moisture content that crumbles in the hand; a good compost is damp, not dripping. The analysis is printed on the side because we have nothing to hide about what is in the bag.

Use it as a season dressing in spring and autumn on vegetable beds, fruit bushes, and the flower border, worked into the top few inches of soil before planting. It improves soil structure, boosts moisture retention in sandy ground, and adds the slow-release nutrient that young plants can draw steadily over the season rather than a sudden flood. It is especially rewarding in a raised bed where the soil has been dug year after year and is beginning to compact. The price is for a 10 kg sack, which covers roughly a 2 m by 1 m bed in a generous layer.

Store the sack in a dry place and it will keep for years without losing its value. For the commercial grower, a wholesale pallet rate is available. The stall recommends buying one sack and testing it against a corner before committing the whole bed, because the soil you are improving is the real test. The bag here is filled to weight on the same scale used for the stall's eggs, so a 10 kg bag is exactly 10 kg. 10 kg

A word about using it in pots if you are short on bed space: a mix of two parts good compost to one part compost this bag will give you a light, moisture-retentive growing medium for containers and window boxes. It is the same mix the stall uses for the seedlings it sells at the gate, so you are literally reusing the recipe. The seedlings sit in it for four weeks before they go to a bed, and they come through it strong. That is the practical evidence for the compost, and it is the reason the stall does not sell anything fancier for the job; there is no need to import a complicated product when a good pile, turned properly, does the work. 10 kg`, 80000, 'https://dummyimage.com/400x300/3E6B4F/FBF8F1&text=Fertilizer', 'suplies', 1],
  ];
  const stmt = db.prepare(`INSERT INTO products (title,description,price,imageUrl,category,wholesale,sellerId) VALUES (?,?,?,?,?,?,?)`);
  demos.forEach((d) => stmt.run(...d));
  stmt.finalize(() => console.log('Seeded 8 demo products.'));
}

initDB();

// API Routes
app.get('/api/auth/register', (req, res) => {
  res.json({ message: 'registration endpoint ready' });
});
app.get('/api/auth/login', (req, res) => {
  res.json({ message: 'login endpoint ready' });
});

app.get('/api/products', (req, res) => {
  db.all(`SELECT p.id, p.title, p.description, p.price, p.imageUrl, p.category, p.wholesale
          FROM products p`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const products = rows.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      price: r.price,
      imageUrl: r.imageUrl,
      category: r.category,
      wholesale: Boolean(r.wholesale),
    }));
    res.json({ count: products.length, products });
  });
});

app.get('/api/cart', (req, res) => {
  res.json({ items: [] });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));