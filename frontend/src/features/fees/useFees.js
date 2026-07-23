import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';

// Fetch active student fee records
export const useGetMyFees = () => {
  return useQuery({
    queryKey: ['myFees'],
    queryFn: async () => {
      const { data } = await api.get('/payments/records/my-fees');
      return data;
    },
  });
};

// Fetch student fee records for staff
export const useGetStudentFees = (studentId) => {
  return useQuery({
    queryKey: ['studentFees', studentId],
    queryFn: async () => {
      if (!studentId) return { data: [] };
      const { data } = await api.get(`/payments/records/student/${studentId}`);
      return data;
    },
    enabled: !!studentId,
  });
};

// Fetch pending fee dues for cashier desk
export const useGetPendingDues = () => {
  return useQuery({
    queryKey: ['pendingDues'],
    queryFn: async () => {
      const { data } = await api.get('/payments/pending-dues');
      return data;
    },
  });
};

// Collect cash/POS fee payment mutation
export const useCollectCashFee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/payments/collect-cash', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myFees'] });
      queryClient.invalidateQueries({ queryKey: ['pendingDues'] });
      queryClient.invalidateQueries({ queryKey: ['totalCollection'] });
    },
  });
};

// Fetch total fee collection sum (Super Admin ONLY)
export const useGetTotalCollection = () => {
  return useQuery({
    queryKey: ['totalCollection'],
    queryFn: async () => {
      const { data } = await api.get('/payments/stats/total-collection');
      return data;
    },
    retry: false, // Do not retry on 403 Access Denied
  });
};
