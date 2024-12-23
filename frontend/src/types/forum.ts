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
  isVisible?: boolean;
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
  isVisible?: boolean;
}


export interface PostCreateInput {
  title: string;
  content: string;
  tags: string[];
}