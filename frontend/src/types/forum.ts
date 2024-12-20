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
