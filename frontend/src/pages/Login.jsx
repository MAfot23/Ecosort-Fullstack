import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach server (port 8000). Please make sure the backend is running via run-ecosort.bat.');
      } else if (err.response?.data?.errors?.email?.[0]) {
        setError(err.response.data.errors.email[0]);
      } else if (err.response?.status === 422 || err.response?.status === 401) {
        setError('Invalid email or password. Password is: admin1234');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please check credentials.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  function fillCredentials(fillEmail, fillPass) {
    setEmail(fillEmail);
    setPassword(fillPass);
    setError('');
  }

  return (
    <div className="auth-wrap">
      <div className="card">
        <h2>Log in to EcoSort</h2>
        {error && <div className="auth-error" style={{ whiteSpace: 'pre-line' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@ecosort.local"
              required
              autoFocus
            />
          </div>
          <div className="field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="password">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#10b981',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  padding: 0,
                  marginBottom: '0.25rem',
                }}
              >
                {showPassword ? '🙈 Hide' : '👁️ Show'}
              </button>
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin1234"
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        {/* Quick Fill Helpers */}
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#0f172a', borderRadius: '8px', border: '1px solid #334155', fontSize: '0.82rem' }}>
          <div style={{ color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>Quick Fill Admin Logins:</div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
              onClick={() => fillCredentials('admin@ecosort.local', 'admin1234')}
            >
              admin@ecosort.local
            </button>
            
          </div>
          <div style={{ color: '#64748b', marginTop: '0.4rem', fontSize: '0.75rem' }}>
            Password for both: <strong>admin1234</strong>
          </div>
        </div>

        <div className="auth-switch">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}
