import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';

// Fetch published global notices
export const useGetNotices = () => {
  return useQuery({
    queryKey: ['notices'],
    queryFn: async () => {
      const { data } = await api.get('/notices');
      return data;
    },
  });
};

// Fetch student work notices
export const useGetStudentWorkNotices = () => {
  return useQuery({
    queryKey: ['notices', 'student-work'],
    queryFn: async () => {
      const { data } = await api.get('/notices/student-work');
      return data;
    },
  });
};

// Fetch all notices for admin management
export const useGetAdminNotices = () => {
  return useQuery({
    queryKey: ['notices', 'admin-all'],
    queryFn: async () => {
      const { data } = await api.get('/notices/admin/all');
      return data;
    },
  });
};

// Create notice mutation
export const useCreateNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/notices', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });
};

// Update notice mutation
export const useUpdateNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put(`/notices/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });
};

// Toggle publish state mutation
export const useTogglePublishNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_published }) => {
      const { data } = await api.patch(`/notices/${id}/publish`, { is_published });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });
};

// Delete notice mutation
export const useDeleteNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/notices/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });
};
