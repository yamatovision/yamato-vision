export interface AdminBadgeResponse {
  id: string;
  title: string;
  description: string;
  iconUrl: string;
  condition: string;
  createdAt: Date;
}

export interface AdminBadgeListResponse {
  success: boolean;
  data: AdminBadgeResponse[];
}
