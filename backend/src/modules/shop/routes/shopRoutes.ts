import { Router } from 'express';
import { ShopController } from '../controllers/shopController';
import { authenticateJWT, requireAdmin } from '../../../shared/middleware/auth';

const router = Router();
const shopController = new ShopController();

// 商品関連のエンドポイント
router.get('/products', authenticateJWT, shopController.getProducts);
router.get('/products/:id', authenticateJWT, shopController.getProductById);
router.post('/products', authenticateJWT, requireAdmin, shopController.createProduct);
router.put('/products/:id', authenticateJWT, requireAdmin, shopController.updateProduct);
router.delete('/products/:id', authenticateJWT, requireAdmin, shopController.deleteProduct);

// 購入関連のエンドポイント
router.post('/purchases', authenticateJWT, shopController.createPurchase);
router.get('/purchases/history', authenticateJWT, shopController.getPurchaseHistory);

export default router;
