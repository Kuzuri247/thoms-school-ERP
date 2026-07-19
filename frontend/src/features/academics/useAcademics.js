import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';

export const useGetMarks = (studentId) => {
  return useQuery({
    queryKey: ['marks', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const { data } = await api.get(`/marks/student/${studentId}`);
      return data;
    },
    enabled: !!studentId,
  });
};

export const useSaveMarks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (marksPayload) => {
      const { data } = await api.post('/marks', marksPayload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marks'] });
    },
  });
};

export const useGetTimetable = (classId) => {
  return useQuery({
    queryKey: ['timetable', classId],
    queryFn: async () => {
      if (!classId) return [];
      const { data } = await api.get(`/timetable/class/${classId}`);
      return data;
    },
    enabled: !!classId,
  });
};
