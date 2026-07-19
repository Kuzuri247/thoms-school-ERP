import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';

export const useGetGlobalOverview = () => {
  return useQuery({
    queryKey: ['globalOverview'],
    queryFn: async () => {
      const { data } = await api.get('/reports/overview');
      return data;
    },
  });
};

export const useGetFinancialReport = () => {
  return useQuery({
    queryKey: ['financialReport'],
    queryFn: async () => {
      const { data } = await api.get('/reports/financial');
      return data;
    },
  });
};
