import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  profileImageUrl?: string;
  userRank: 'お試し' | '退会者' | '初伝' | '中伝' | '奥伝' | '皆伝' | '管理者';
  registrationDate: Date;
  lastLoginDate?: Date;
  totalConversations: number;
  dailyConversationLimit: number;
  availableFactories: mongoose.Types.ObjectId[];
  lastPermissionChange: Date;
  isAdmin(): boolean;
  isDeactivated(): boolean;
}

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function(this: IUser) {
      return this.isNew;
    }
  },
  name: {
    type: String,
    trim: true
  },
  profileImageUrl: String,
  userRank: {
    type: String,
    enum: ['お試し', '退会者', '初伝', '中伝', '奥伝', '皆伝', '管理者'],
    default: 'お試し'
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  lastLoginDate: Date,
  totalConversations: {
    type: Number,
    default: 0
  },
  dailyConversationLimit: {
    type: Number,
    default: 10
  },
  availableFactories: [{
    type: Schema.Types.ObjectId,
    ref: 'Factory'
  }],
  lastPermissionChange: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// パスワードのハッシュ化
userSchema.pre<IUser>('save', async function(next) {
  try {
    if (this.isModified('password') && this.password) {
      this.password = await bcrypt.hash(this.password, 8);
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.methods.isAdmin = function(): boolean {
  return this.userRank === '管理者';
};

userSchema.methods.isDeactivated = function(): boolean {
  return this.userRank === '退会者';
};

// すでに同じ名前のモデルが登録されている場合は既存のモデルを使用
export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
