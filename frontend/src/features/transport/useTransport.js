import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';

export const useGetRoutes = () => {
  return useQuery({
    queryKey: ['transportRoutes'],
    queryFn: async () => {
      const { data } = await api.get('/transport/routes');
      return data;
    },
  });
};

export const useGetStudentTransport = (studentId) => {
  return useQuery({
    queryKey: ['studentTransport', studentId],
    queryFn: async () => {
      if (!studentId) return null;
      const { data } = await api.get(`/transport/student/${studentId}`);
      return data;
    },
    enabled: !!studentId,
  });
};
