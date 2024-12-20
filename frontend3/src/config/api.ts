export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  ADMIN: {
    USERS: '/admin/users',  // /api は削除
    USER_PENALTY: (userId: string) => `/admin/users/${userId}/penalty`,
    USER_BADGES: (userId: string) => `/admin/users/${userId}/badges`,
    USER_GEMS: (userId: string) => `/admin/users/${userId}/gems`,
  }
};
