export interface PostCreateInput {
  title: string;
  content: string;
  tags?: string[];
}

export interface Post extends PostCreateInput {
  id: string;
  authorId: string;
  authorName: string;
  authorRank: string;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  commentsCount: number;
  isVisible: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorRank: string;
  content: string;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
  isVisible: boolean;
}
