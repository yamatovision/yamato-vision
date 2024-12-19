export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRank: string;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  commentsCount: number;
  tags: string[];
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRank: string;
  createdAt: Date;
  likes: number;
}

export interface PostCreateInput {
  title: string;
  content: string;
  tags: string[];
}

export interface CommentCreateInput {
  content: string;
  postId: string;
}
