import api from './auth';
import { HomePageData } from '@/types/home';

interface HomeDataResponse {
  success: boolean;
  data: HomePageData;
  message?: string;
}

export const homeAPI = {
  async getHomeData(): Promise<HomeDataResponse> {
    try {
      const response = await api.get('/users/home-data');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch home data:', error);
      throw error;
    }
  }
};
