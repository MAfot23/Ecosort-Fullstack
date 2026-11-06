import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ecosort_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.get('/user')
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem('ecosort_token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const res = await api.post('/login', { email, password });
    localStorage.setItem('ecosort_token', res.data.token);
    setUser(res.data.user);
  }

  async function register(name, email, password, password_confirmation) {
    const res = await api.post('/register', { name, email, password, password_confirmation });
    localStorage.setItem('ecosort_token', res.data.token);
    setUser(res.data.user);
  }

  async function logout() {
    try {
      await api.post('/logout');
    } catch (e) {
      // token may already be invalid — ignore
    }
    localStorage.removeItem('ecosort_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
