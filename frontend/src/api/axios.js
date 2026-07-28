import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  let token = localStorage.getItem('token');
  if (!token) {
    try {
      const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      token = authStorage.state?.accessToken;
    } catch {}
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      window.location.pathname !== '/' &&
      window.location.pathname !== '/login'
    ) {
      originalRequest._retry = true;
      try {
        const refreshUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/auth/refresh';
        const res = await axios.post(refreshUrl, {}, { withCredentials: true });
        const newToken = res.data?.accessToken || res.data?.data?.accessToken;
        if (newToken) {
          localStorage.setItem('token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        localStorage.removeItem('token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;