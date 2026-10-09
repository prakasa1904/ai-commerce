import express from 'express';
import { requireAuth } from './auth.js';
import {
  listUsers, getUser, createUser, updateUser, softDeleteUser, restoreUser,
  listShops, getShop, createShop, updateShop, softDeleteShop, restoreShop,
  listMembersOfShop, addShopMember, updateShopMember, removeShopMember,
  listProductsInShop,
  listProductsAdmin, getAdminProduct, createAdminProduct, updateAdminProduct,
  softDeleteProduct, restoreProduct, listProductShops, linkProductToShop,
  unlinkProductFromShop, getAdminStats, canManageShop, canAccessShop, getShopMembershipRole,
} from './adminService.js';

const router = express.Router();

function platformAdminOnly(req, res, next) {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Platform admins only.' });
  next();
}

router.use(requireAuth);
router.use('/users', ...(() => {
  const sub = express.Router();
  sub.use(platformAdminOnly);

  sub.get('/', async (req, res) => {
    try {
      const users = await listUsers({
        includeDeleted: req.query.includeDeleted === '1',
        q: req.query.q ? String(req.query.q) : '',
      });
      res.json({ count: users.length, users });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  sub.post('/', async (req, res) => {
    try {
      const { username, name, email, password, role = 'buyer', isAdmin = false } = req.body || {};
      if (!username || !email || !password) return res.status(400).json({ error: 'username, email and password are required.' });
      const user = await createUser({ username, name, email, password, role, isAdmin });
      res.status(201).json({ user });
    } catch (err) {
      res.status(409).json({ error: err.message });
    }
  });

  sub.get('/:id', async (req, res) => {
    try {
      const user = await getUser(Number(req.params.id));
      if (!user) return res.status(404).json({ error: 'User not found.' });
      res.json({ user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  sub.patch('/:id', async (req, res) => {
    try {
      const user = await updateUser(Number(req.params.id), req.body || {});
      if (!user) return res.status(404).json({ error: 'User not found.' });
      res.json({ user });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  sub.delete('/:id', async (req, res) => {
    try {
      await softDeleteUser(Number(req.params.id));
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  sub.post('/:id/restore', async (req, res) => {
    try {
      await restoreUser(Number(req.params.id));
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  return [sub];
})());

router.use('/stats', async (req, res) => {
  try {
    res.json(await getAdminStats());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.use('/shops', ...(() => {
  const sub = express.Router();

  sub.get('/', async (req, res) => {
    try {
      const ownerId = req.user.isAdmin ? null : req.user.id;
      const shops = await listShops({
        includeDeleted: req.query.includeDeleted === '1' && Boolean(req.user.isAdmin),
        ownerId,
        q: req.query.q ? String(req.query.q) : '',
      });
      res.json({ count: shops.length, shops });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  sub.post('/', async (req, res) => {
    try {
      const shop = await createShop({ ownerId: req.user.id, ...req.body });
      res.status(201).json({ shop });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  sub.get('/:id', async (req, res) => {
    try {
      const shop = await getShop(Number(req.params.id));
      if (!shop) return res.status(404).json({ error: 'Shop not found.' });
      if (!req.user.isAdmin && shop.ownerId !== req.user.id) {
        const memberRole = await getShopMembershipRole({ shopId: shop.id, userId: req.user.id });
        if (!memberRole) return res.status(404).json({ error: 'Shop not found.' });
      }
      res.json({ shop });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  sub.patch('/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const shop = await getShop(id);
      if (!shop) return res.status(404).json({ error: 'Shop not found.' });
      // Non-admin members may update but cannot delete (delete uses canManageShop below).
      const allowed = await canAccessShop({ shopId: id, userId: req.user.id, isPlatformAdmin: req.user.isAdmin });
      if (!allowed) return res.status(403).json({ error: 'Forbidden.' });
      const updated = await updateShop(id, req.body || {});
      res.json({ shop: updated });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  sub.delete('/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const allowed = await canManageShop({ shopId: id, userId: req.user.id, isPlatformAdmin: req.user.isAdmin });
      if (!allowed) return res.status(403).json({ error: 'Forbidden.' });
      await softDeleteShop(id);
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Products in this shop
  sub.get('/:id/products', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const shop = await getShop(id);
      if (!shop) return res.status(404).json({ error: 'Shop not found.' });
      if (!req.user.isAdmin && shop.ownerId !== req.user.id) {
        const memberRole = await getShopMembershipRole({ shopId: id, userId: req.user.id });
        if (!memberRole) return res.status(404).json({ error: 'Shop not found.' });
      }
      const products = await listProductsInShop(id);
      res.json({ products });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Shop members
  sub.get('/:id/members', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const shop = await getShop(id);
      if (!shop) return res.status(404).json({ error: 'Shop not found.' });
      if (!req.user.isAdmin && shop.ownerId !== req.user.id) {
        const memberRole = await getShopMembershipRole({ shopId: id, userId: req.user.id });
        if (!memberRole) return res.status(404).json({ error: 'Shop not found.' });
      }
      res.json({ members: await listMembersOfShop(id) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  sub.post('/:id/members', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { userId, role = 'non_admin' } = req.body || {};
      if (!userId) return res.status(400).json({ error: 'userId is required.' });
      const shop = await getShop(id);
      if (!shop) return res.status(404).json({ error: 'Shop not found.' });
      const shopAuth = await canManageShop({ shopId: id, userId: req.user.id, isPlatformAdmin: req.user.isAdmin });
      if (!shopAuth) return res.status(403).json({ error: 'Forbidden.' });
      const members = await addShopMember({ shopId: id, userId: Number(userId), role });
      res.json({ members });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  sub.patch('/:id/members/:userId', async (req, res) => {
    try {
      const shopId = Number(req.params.id);
      const userId = Number(req.params.userId);
      const { role } = req.body || {};
      if (!role) return res.status(400).json({ error: 'role is required.' });
      const shop = await getShop(shopId);
      if (!shop) return res.status(404).json({ error: 'Shop not found.' });
      const shopAuth = await canManageShop({ shopId, userId: req.user.id, isPlatformAdmin: req.user.isAdmin });
      if (!shopAuth) return res.status(403).json({ error: 'Forbidden.' });
      const members = await updateShopMember({ shopId, userId, role });
      res.json({ members });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  sub.delete('/:id/members/:userId', async (req, res) => {
    try {
      const shopId = Number(req.params.id);
      const userId = Number(req.params.userId);
      const shop = await getShop(shopId);
      if (!shop) return res.status(404).json({ error: 'Shop not found.' });
      const shopAuth = await canManageShop({ shopId, userId: req.user.id, isPlatformAdmin: req.user.isAdmin });
      if (!shopAuth) return res.status(403).json({ error: 'Forbidden.' });
      // Non-admin members can't delete membership records.
      const requesterRole = req.user.isAdmin ? 'admin' : (await getShopMembershipRole({ shopId, userId: req.user.id })) || (shop.ownerId === req.user.id ? 'admin' : 'non_admin');
      await removeShopMember({ shopId, userId, requesterRole });
      res.json({ ok: true });
    } catch (err) {
      if (err.status === 403) return res.status(403).json({ error: 'Non-admin members cannot delete.' });
      res.status(500).json({ error: err.message });
    }
  });

  return [sub];
})());

router.use('/products', ...(() => {
  const sub = express.Router();

  sub.get('/', async (req, res) => {
    try {
      const ownerId = req.user.isAdmin ? null : req.user.id;
      const products = await listProductsAdmin({
        includeDeleted: req.query.includeDeleted === '1' && Boolean(req.user.isAdmin),
        ownerId,
        q: req.query.q ? String(req.query.q) : '',
      });
      res.json({ count: products.length, products });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  sub.post('/', async (req, res) => {
    try {
      const product = await createAdminProduct({ ownerId: req.user.id, ...req.body });
      res.status(201).json({ product });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
    ;
  });

  sub.get('/:id', async (req, res) => {
    try {
      const product = await getAdminProduct(Number(req.params.id));
      if (!product) return res.status(404).json({ error: 'Product not found.' });
      res.json({ product });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  sub.get('/:id/shops', async (req, res) => {
    try {
      const product = await getAdminProduct(Number(req.params.id));
      if (!product) return res.status(404).json({ error: 'Product not found.' });
      res.json({ shops: await listProductShops(product.id) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  sub.patch('/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const product = await getAdminProduct(id);
      if (!product) return res.status(404).json({ error: 'Product not found.' });
      const allowed = product.ownerId === req.user.id || req.user.isAdmin;
      if (!allowed) return res.status(403).json({ error: 'Forbidden.' });
      const updated = await updateAdminProduct(id, req.body || {});
      res.json({ product: updated });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  sub.delete('/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const product = await getAdminProduct(id);
      if (!product) return res.status(404).json({ error: 'Product not found.' });
      const allowed = product.ownerId === req.user.id || req.user.isAdmin;
      if (!allowed) return res.status(403).json({ error: 'Forbidden.' });
      await softDeleteProduct(id);
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  sub.post('/:id/restore', async (req, res) => {
    try {
      await restoreProduct(Number(req.params.id));
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  sub.post('/:id/shops', async (req, res) => {
    try {
      const productId = Number(req.params.id);
      const product = await getAdminProduct(productId);
      if (!product) return res.status(404).json({ error: 'Product not found.' });
      const { shopId, price, stock } = req.body || {};
      if (!shopId) return res.status(400).json({ error: 'shopId is required.' });
      const shop = await getShop(Number(shopId));
      if (!shop) return res.status(404).json({ error: 'Shop not found.' });
      // A product can only be linked to shops owned by the same user.
      if (shop.ownerId !== product.ownerId) {
        return res.status(409).json({ error: 'A product can only be listed in shops owned by the same user.' });
      }
      const allowed = shop.ownerId === req.user.id || req.user.isAdmin;
      if (!allowed) return res.status(403).json({ error: 'Forbidden.' });
      await linkProductToShop({ productId, shopId: Number(shopId), price, stock });
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  sub.delete('/:id/shops/:shopId', async (req, res) => {
    try {
      const productId = Number(req.params.id);
      const shopId = Number(req.params.shopId);
      const product = await getAdminProduct(productId);
      if (!product) return res.status(404).json({ error: 'Product not found.' });
      const shop = await getShop(shopId);
      if (!shop) return res.status(404).json({ error: 'Shop not found.' });
      const allowed = shop.ownerId === req.user.id || req.user.isAdmin;
      if (!allowed) return res.status(403).json({ error: 'Forbidden.' });
      await unlinkProductFromShop({ productId, shopId });
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return [sub];
})());

export { router as adminRouter };