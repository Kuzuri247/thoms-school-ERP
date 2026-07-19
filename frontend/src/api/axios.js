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
    if (
      error.response?.status === 401 &&
      window.location.pathname !== '/' &&
      window.location.pathname !== '/login'
    ) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;