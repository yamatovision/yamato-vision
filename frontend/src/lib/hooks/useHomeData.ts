import { useState, useEffect } from 'react';
import { homeAPI } from '@/lib/api/home';
import { HomePageData } from '@/types/home';

export function useHomeData() {
  const [data, setData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await homeAPI.getHomeData();
        setData(response.data);
        setError(null);
      } catch (error) {
        setError('データの取得に失敗しました');
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}