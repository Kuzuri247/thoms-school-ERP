import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';

export const useCollectFee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (paymentPayload) => {
      // paymentPayload: { studentId, amount, paymentMode, feeType, notes }
      const { data } = await api.post('/payments/collect', paymentPayload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeHistory'] });
    },
  });
};

export const useFeeHistory = (studentId) => {
  return useQuery({
    queryKey: ['feeHistory', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const { data } = await api.get(`/payments/history/${studentId}`);
      return data;
    },
    enabled: !!studentId,
  });
};
