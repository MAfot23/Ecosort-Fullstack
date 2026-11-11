import axios from 'axios';

// Automatically adapt baseURL:
// - Local Vite Dev (port 5173): routes to http://<hostname>:8000/api (works on PC and phone)
// - Production Cloud Deployment: routes to '/api' on the same domain (no CORS needed)
let defaultApiHost = '/api';
if (typeof window !== 'undefined' && window.location) {
  const host = window.location.hostname;
  const port = window.location.port;
  if (port === '5173' || port === '5174') {
    defaultApiHost = `http://${host}:8000/api`;
  }
}

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
