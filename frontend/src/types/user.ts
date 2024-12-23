export interface User {
  id: string;
  name: string;
  nickname?: string;
  rank: string;
  level: number;
  experience: number;
  gems: number;
  avatarUrl?: string;
  message?: string;
  snsLinks: {
    [key: string]: string;
  };
  badges: Array<{
    id: string;
    title: string;
    iconUrl: string;
  }>;
}