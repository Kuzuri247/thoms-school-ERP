import axios from 'axios';
import useAuthStore from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = false;
api.interceptors.response.use(
  r => r,
  async err => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry && !refreshing) {
      original._retry = true;
      refreshing = true;
      try {
        const { data } = await api.post('/auth/refresh');
        useAuthStore.getState().setAccessToken(data.data.accessToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        refreshing = false;
        return api(original);
      } catch {
        refreshing = false;
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;