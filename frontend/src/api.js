import axios from 'axios';

// Automatically adapt to localhost or local Wi-Fi IP (e.g. 192.168.x.x) when accessed from a mobile phone
const defaultApiHost = typeof window !== 'undefined' && window.location.hostname
  ? `http://${window.location.hostname}:8000/api`
  : 'http://localhost:8000/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiHost,
});

// Attach the saved auth token (if any) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ecosort_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
