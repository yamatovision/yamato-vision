import { Request, Response } from 'express';
import { ProductService } from '../services/productService';
import { PurchaseService } from '../services/purchaseService';
import { AuthenticatedRequest } from '../../../shared/types/auth.types';
import { ProductType } from '@prisma/client';

export class ShopController {
  private productService: ProductService;
  private purchaseService: PurchaseService;

  constructor() {
    this.productService = new ProductService();
    this.purchaseService = new PurchaseService();
  }

  getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      
      // 型変換を適切に行う
      const type = req.query.type as string;
      const filters = {
        type: type ? (type as ProductType) : undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        rankRequired: req.query.rank as string,
        levelRequired: req.query.level ? Number(req.query.level) : undefined,
        isActive: true
      };

      const result = await this.productService.getProducts(filters, page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: '商品一覧の取得に失敗しました' 
      });
    }
  };

  getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await this.productService.getProductById(req.params.id);
      if (!product) {
        res.status(404).json({ success: false, error: '商品が見つかりません' });
        return;
      }
      res.json({ success: true, data: product });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: '商品の取得に失敗しました' 
      });
    }
  };

  createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await this.productService.createProduct(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: '商品の作成に失敗しました' 
      });
    }
  };

  updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await this.productService.updateProduct(req.params.id, req.body);
      res.json({ success: true, data: product });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: '商品の更新に失敗しました' 
      });
    }
  };

  deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.productService.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: '商品の削除に失敗しました' 
      });
    }
  };

  createPurchase = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user?.id) {
        res.status(401).json({ success: false, error: '認証が必要です' });
        return;
      }

      const { productId, amount } = req.body;

      const result = await this.purchaseService.createPurchase(
        authReq.user.id,
        productId,
        amount
      );

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : '購入処理に失敗しました' 
      });
    }
  };

  getPurchaseHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user?.id) {
        res.status(401).json({ success: false, error: '認証が必要です' });
        return;
      }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await this.purchaseService.getPurchaseHistory(
        authReq.user.id,
        page,
        limit
      );

      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: '購入履歴の取得に失敗しました' 
      });
    }
  };
}
