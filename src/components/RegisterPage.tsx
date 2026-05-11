import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegisterMutation } from '../store/api/authApi';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const [register, { isLoading, error }] = useRegisterMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await register({ name, email, password });
    if (!('error' in result)) {
      navigate('/', { replace: true });
    }
  };

  const errorMessage =
    error && 'data' in error
      ? (error.data as { message?: string })?.message ?? 'Registration failed'
      : null;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">✓</div>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Start managing your tasks</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {errorMessage && (
            <div className="auth-error">{errorMessage}</div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">
              Name <span className="optional">(optional)</span>
            </label>
            <input
              id="reg-name"
              className="form-input"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
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
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              className="form-input"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <button
            className="auth-submit-btn"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? <span className="btn-spinner" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-toggle">
          Already have an account?{' '}
          <Link className="auth-toggle-btn" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
