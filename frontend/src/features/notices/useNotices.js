import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';

export const useGetNotices = () => {
  return useQuery({
    queryKey: ['notices'],
    queryFn: async () => {
      const { data } = await api.get('/notices');
      return data;
    },
  });
};
