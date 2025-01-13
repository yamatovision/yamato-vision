import { Request, Response } from 'express';
import { UserCourseService } from './userCourseService';
import { CourseProgressManager } from '../progress/courseProgressManager';
import { CourseStatusManager } from '../progress/courseStatusManager';

export class UserCourseController {
  private courseService: UserCourseService;
  private progressManager: CourseProgressManager;
  private statusManager: CourseStatusManager;  // 追加

  constructor() {
    this.courseService = new UserCourseService();
    this.progressManager = new CourseProgressManager();
    this.statusManager = new CourseStatusManager();  // 追加
  }

  getAvailableCourses = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const courses = await this.courseService.getAvailableCourses(userId);
      res.json({
        success: true,
        data: courses
      });
    } catch (error) {
      console.error('Error getting available courses:', error);
      res.status(500).json({
        success: false,
        message: 'コース一覧の取得に失敗しました'
      });
    }
  };

  getUserCourses = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const courses = await this.courseService.getUserCourses(userId);
      res.json({
        success: true,
        data: courses
      });
    } catch (error) {
      console.error('Error getting user courses:', error);
      res.status(500).json({
        success: false,
        message: '受講中のコース一覧の取得に失敗しました'
      });
    }
  };
  // UserCourseController内のgetActiveUsersメソッドを修正

getActiveUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    if (!courseId) {
      res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
      return;
    }

    const { users } = await this.courseService.getActiveCourseUsers(courseId);
    res.json({
      success: true,
      data: { users }  // data.usersの形式で返す
    });
  } catch (error) {
    console.error('Error getting active users:', error);
    res.status(500).json({
      success: false,
      message: 'アクティブユーザーの取得に失敗しました'
    });
  }
};


getCurrentUserCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
      return;
    }

    const course = await this.courseService.getCurrentUserCourse(userId);
    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error getting current course:', error);
    res.status(500).json({
      success: false,
      message: '現在のコースの取得に失敗しました'
    });
  }
};

// userCourseController.ts
getCourseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { courseId } = req.params;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const course = await this.courseService.getCourseById(userId, courseId); // 修正箇所
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'コースが見つかりません'
      });
      return;
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error getting course by id:', error);
    res.status(500).json({
      success: false,
      message: 'コースの取得に失敗しました'
    });
  }
};
// userCourseController.ts// userCourseController.ts

getCurrentCourseState = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('getCurrentCourseState called with user:', req.user); // ユーザー情報確認
    const userId = req.user?.id;
    
    if (!userId) {
      console.log('No userId found in request');
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const currentState = await this.statusManager.getCurrentCourseState(userId);
    console.log('Current state retrieved:', currentState); // 取得したステート確認

    if (!currentState) {
      // nullの場合は404ではなく、正常なレスポンスとして返す
      res.json({
        success: true,
        data: null
      });
      return;
    }

    res.json({
      success: true,
      data: currentState
    });
  } catch (error) {
    console.error('Error in getCurrentCourseState:', error); // エラー詳細確認
    res.status(500).json({
      success: false,
      message: '現在のコース状態の取得に失敗しました'
    });
  }
};
formatCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { courseId } = req.params;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
      return;
    }

    await this.courseService.formatCourse(userId, courseId);
    res.json({
      success: true,
      message: 'コースを初期化しました'
    });
  } catch (error) {
    console.error('Error formatting course:', error);
    res.status(500).json({
      success: false,
      message: 'コースの初期化に失敗しました'
    });
  }
};

selectCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { courseId } = req.params;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
      return;
    }

    await this.courseService.selectCourse(userId, courseId);
    res.json({
      success: true,
      message: 'コースを選択しました'
    });
  } catch (error) {
    console.error('Error selecting course:', error);
    res.status(500).json({
      success: false,
      message: 'コースの選択に失敗しました'
    });
  }
};
activateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { courseId } = req.params;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
      return;
    }

    await this.courseService.activateCourse(userId, courseId);
    res.json({
      success: true,
      message: 'コースを開始しました'
    });
  } catch (error) {
    console.error('Error activating course:', error);
    res.status(500).json({
      success: false,
      message: 'コースの開始に失敗しました'
    });
  }
};

  purchaseCourse = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { courseId } = req.params;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const eligibilityCheck = await this.courseService.checkPurchaseEligibility(userId, courseId);
      if (!eligibilityCheck.success) {
        res.status(400).json({
          success: false,
          message: eligibilityCheck.error
        });
        return;
      }

      res.json({
        success: true,
        message: 'コースを購入しました'
      });
    } catch (error) {
      console.error('Error purchasing course:', error);
      res.status(500).json({
        success: false,
        message: 'コースの購入に失敗しました'
      });
    }
  };

  startCourse = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { courseId } = req.params;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const hasAccess = await this.courseService.checkCourseAccess(userId, courseId);
      if (!hasAccess) {
        res.status(403).json({
          success: false,
          message: 'このコースにアクセスする権限がありません'
        });
        return;
      }

      const startedCourse = await this.progressManager.restartCourse(userId, courseId);
      res.json({
        success: true,
        data: startedCourse,
        message: 'コースを開始しました'
      });
    } catch (error) {
      console.error('Error starting course:', error);
      res.status(500).json({
        success: false,
        message: 'コースの開始に失敗しました'
      });
    }
  };

  getCourseProgress = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { courseId } = req.params;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      res.json({
        success: true,
      });
    } catch (error) {
      console.error('Error getting course progress:', error);
      res.status(500).json({
        success: false,
        message: '進捗状況の取得に失敗しました'
      });
    }
  };
}
