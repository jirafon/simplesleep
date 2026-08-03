import axios from 'axios';
import { getApiUrl, API_BASE_URL } from './api';
import { getCookie, removeCookie } from '../utils/cookies';

const apiClient = axios.create({
  baseURL: API_BASE_URL ? `${API_BASE_URL}/api` : '/api',
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getCookie('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const lang = getCookie('siempresleep-language') || getCookie('unbiax-language') || 'en';
    config.headers['Accept-Language'] = lang === 'es' ? 'es' : 'en';
    config.headers['X-Language'] = lang === 'es' ? 'es' : 'en';
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeCookie('token');
      removeCookie('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
