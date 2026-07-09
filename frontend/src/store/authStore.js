import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          set({ user: data.data.user, accessToken: data.data.accessToken, isLoading: false });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, error: err.response?.data?.message || 'Login failed' };
        }
      },

      logout: async () => {
        try { await api.post('/auth/logout'); } catch {}
        set({ user: null, accessToken: null });
      },

      setAccessToken: (token) => set({ accessToken: token }),
    }),
    { name: 'auth-storage', partialize: (s) => ({ user: s.user }) }
  )
);

export default useAuthStore;