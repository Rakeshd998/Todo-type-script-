import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForgotPasswordMutation } from '../store/api/authApi';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [forgotPassword, { isLoading, error }] = useForgotPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await forgotPassword({ email });
    if (!('error' in result)) {
      setSubmitted(true);
    }
  };

  const errorMessage =
    error && 'data' in error
      ? (error.data as { message?: string })?.message ?? 'Something went wrong'
      : null;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">🔐</div>
          <h1 className="auth-title">Forgot password?</h1>
          <p className="auth-subtitle">
            {submitted
              ? 'Check your inbox for the reset link'
              : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        {submitted ? (
          <div className="auth-success-box">
            <div className="auth-success-icon">✉️</div>
            <p className="auth-success-text">
              If <strong>{email}</strong> is registered, you'll receive a password reset email
              within a few minutes. Check your spam folder if you don't see it.
            </p>
            <Link className="auth-submit-btn auth-submit-btn--outline" to="/login">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            {errorMessage && (
              <div className="auth-error">{errorMessage}</div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="forgot-email">Email</label>
              <input
                id="forgot-email"
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <button
              className="auth-submit-btn"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? <span className="btn-spinner" /> : 'Send Reset Link'}
            </button>
          </form>
        )}

        {!submitted && (
          <p className="auth-toggle">
            Remember your password?{' '}
            <Link className="auth-toggle-btn" to="/login">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
