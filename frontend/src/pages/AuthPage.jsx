import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthPage = () => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/dashboard';

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await signup(form);
      }
      navigate(redirectPath, { replace: true });
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section container auth-layout">
      <div className="auth-card">
        <div className="auth-switch">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
            Login
          </button>
          <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <label>
              Name
              <input type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} required />
            </label>
          )}

          <label>
            Email
            <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} required />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              required
              minLength={8}
            />
          </label>

          {mode === 'signup' && (
            <label>
              Address
              <textarea value={form.address} onChange={(e) => handleChange('address', e.target.value)} rows="3" />
            </label>
          )}

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
          {error && <p className="error-text">{error}</p>}
        </form>
      </div>
    </section>
  );
};

export default AuthPage;
