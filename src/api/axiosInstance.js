import axios from 'axios';
import { getToken, setToken } from './auth';

const API_BASE = 'https://contribution-backend-3ka2.onrender.com';

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Accept': '*/*',
  },
});

// Request interceptor: add Bearer token and Content-Type for JSON
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (!config.headers['Content-Type'] && config.data && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: logout on 401/403 (token expired or forbidden)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      setToken(null);
      localStorage.removeItem('contribution_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
export { API_BASE };
