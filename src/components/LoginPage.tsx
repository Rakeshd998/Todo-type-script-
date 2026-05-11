import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLoginMutation } from '../store/api/authApi';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const [login, { isLoading, error }] = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login({ email, password });
    if (!('error' in result)) {
      navigate('/', { replace: true });
    }
  };

  const errorMessage =
    error && 'data' in error
      ? (error.data as { message?: string })?.message ?? 'Login failed'
      : null;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">✓</div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {errorMessage && (
            <div className="auth-error">{errorMessage}</div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="form-input"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            className="auth-submit-btn"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? <span className="btn-spinner" /> : 'Sign In'}
          </button>
        </form>

        <p className="auth-toggle">
          Don't have an account?{' '}
          <Link className="auth-toggle-btn" to="/register">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
