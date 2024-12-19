export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name?: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  level: number;
  experience: number;
  rank: string;
  gems: number;
  status: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  error?: string;
}
