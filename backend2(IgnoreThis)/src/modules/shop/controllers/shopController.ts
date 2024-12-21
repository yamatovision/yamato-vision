import { Response } from 'express';
import { AuthenticatedRequest } from '../../../shared/types/auth.types';
import { ProductService } from '../services/productService';
import { PurchaseService } from '../services/purchaseService';

export class ShopController {
  static async getProducts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const filters = req.query;
      const products = await ProductService.getProducts(filters);
      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Failed to get products:', error);
      res.status(500).json({
        success: false,
        error: '商品一覧の取得に失敗しました'
      });
    }
  }

  static async getProductById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const product = await ProductService.getProductById(productId);
      
      if (!product) {
        res.status(404).json({
          success: false,
          error: '商品が見つかりません'
        });
        return;
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Failed to get product:', error);
      res.status(500).json({
        success: false,
        error: '商品の取得に失敗しました'
      });
    }
  }

  static async createPurchase(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;  // idをuserIdに変更
      if (!userId) {
        res.status(401).json({
          success: false,
          error: '認証が必要です'
        });
        return;
      }

      const { productId, amount } = req.body;
      const purchase = await PurchaseService.createPurchase({
        userId,
        productId,
        amount,
        unitPrice: 0 // この値は後でProductServiceから取得する必要があります
      });

      res.status(201).json({
        success: true,
        data: purchase
      });
    } catch (error) {
      console.error('Failed to create purchase:', error);
      res.status(500).json({
        success: false,
        error: '購入処理に失敗しました'
      });
    }
  }

  static async getPurchaseHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;  // idをuserIdに変更
      if (!userId) {
        res.status(401).json({
          success: false,
          error: '認証が必要です'
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const history = await PurchaseService.getPurchaseHistory(userId, page, limit);
      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Failed to get purchase history:', error);
      res.status(500).json({
        success: false,
        error: '購入履歴の取得に失敗しました'
      });
    }
  }

  static async createProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const product = await ProductService.createProduct(req.body);
      res.status(201).json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Failed to create product:', error);
      res.status(500).json({
        success: false,
        error: '商品の作成に失敗しました'
      });
    }
  }

  static async updateProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const product = await ProductService.updateProduct(productId, req.body);
      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Failed to update product:', error);
      res.status(500).json({
        success: false,
        error: '商品の更新に失敗しました'
      });
    }
  }

  static async deleteProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      await ProductService.deleteProduct(productId);
      res.json({
        success: true,
        message: '商品を削除しました'
      });
    } catch (error) {
      console.error('Failed to delete product:', error);
      res.status(500).json({
        success: false,
        error: '商品の削除に失敗しました'
      });
    }
  }
}
