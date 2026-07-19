import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';

export const useGetAttendanceByDate = (date) => {
  return useQuery({
    queryKey: ['attendance', date],
    queryFn: async () => {
      if (!date) return [];
      const { data } = await api.get(`/admin/attendance?date=${date}`);
      return data;
    },
    enabled: !!date,
  });
};

export const useSaveAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ date, attendanceData }) => {
      const { data } = await api.post('/admin/attendance', { date, attendanceData });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', variables.date] });
    },
  });
};
