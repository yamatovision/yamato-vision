import bcrypt from 'bcryptjs';
import { User } from '../models/UserModel';

export const AuthService = {
  async authenticateUser(email: string, password: string) {
    try {
      const user = await User.findOne({ email });
      
      if (!user) {
        return { success: false, message: 'メールアドレスまたはパスワードが正しくありません' };
      }

      if (user.userRank === '退会者') {
        return { success: false, message: 'このアカウントは退会済みです' };
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return { success: false, message: 'メールアドレスまたはパスワードが正しくありません' };
      }

      return { success: true, user };
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, message: '認証中にエラーが発生しました' };
    }
  }
};
