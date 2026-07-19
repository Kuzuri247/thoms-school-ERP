import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null, // { id, full_name, email, role }
      accessToken: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          const user = data.data?.user || data.user || data;
          const token = data.data?.accessToken || data.accessToken || data.token;
          
          if (token) {
            localStorage.setItem('token', token);
          }
          
          set({ user, accessToken: token, isLoading: false });
          return { success: true, user };
        } catch (err) {
          set({ isLoading: false });
          return {
            success: false,
            error: err.response?.data?.message || err.response?.data?.error || 'Login failed',
          };
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {}
        localStorage.removeItem('token');
        set({ user: null, accessToken: null });
      },

      setAuth: (user, token) => {
        if (token) localStorage.setItem('token', token);
        set({ user, accessToken: token });
      },

      hasRole: (allowedRoles) => {
        const user = get().user;
        if (!user || !user.role) return false;
        if (allowedRoles.includes('*')) return true;

        const normalizedUserRole = user.role.toLowerCase().replace(/\s+/g, '_');
        return allowedRoles.some((role) => {
          const norm = role.toLowerCase().replace(/\s+/g, '_');
          if (norm === 'admin' && (normalizedUserRole === 'admin' || normalizedUserRole === 'super_admin')) {
            return true;
          }
          if (norm === 'teacher' && (normalizedUserRole === 'teacher' || normalizedUserRole === 'teachers')) {
            return true;
          }
          if (norm === 'student' && (normalizedUserRole === 'student' || normalizedUserRole === 'students')) {
            return true;
          }
          return norm === normalizedUserRole;
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken }),
    }
  )
);

export default useAuthStore;