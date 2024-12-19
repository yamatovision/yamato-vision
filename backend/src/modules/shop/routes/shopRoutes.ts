import express from 'express';
import { auth, requireAdmin } from '../../../shared/middleware/auth';
import { ShopController } from '../controllers/shopController';

const router = express.Router();

// 認証が必要なルート
router.use(auth);

// ユーザー向けルート
router.get('/products', ShopController.getProducts);
router.get('/products/:productId', ShopController.getProductById);
router.post('/purchase', ShopController.createPurchase);
router.get('/purchases/history', ShopController.getPurchaseHistory);

// 管理者向けルート
router.post('/admin/products', requireAdmin, ShopController.createProduct);
router.put('/admin/products/:productId', requireAdmin, ShopController.updateProduct);
router.delete('/admin/products/:productId', requireAdmin, ShopController.deleteProduct);

export default router;
