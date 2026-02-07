import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || '';

const axiosClient = axios.create({
  baseURL: apiUrl,
});

axiosClient.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  response => response,
  error => {
    const hasAuthToken = Boolean(localStorage.getItem('auth_token'));
    const hasAuthHeader = Boolean(
      error?.config?.headers?.Authorization ||
        error?.config?.headers?.authorization,
    );

    if (error.response && error.response.status === 401 && (hasAuthToken || hasAuthHeader)) {
      localStorage.removeItem('auth_token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
