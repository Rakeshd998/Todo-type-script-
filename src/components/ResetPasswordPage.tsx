import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useResetPasswordMutation } from '../store/api/authApi';

const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [clientError, setClientError] = useState('');
  const [success, setSuccess] = useState(false);

  const [resetPassword, { isLoading, error }] = useResetPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError('');

    if (password !== confirm) {
      setClientError('Passwords do not match.');
      return;
    }
    if (!token) {
      setClientError('Invalid reset link.');
      return;
    }

    const result = await resetPassword({ token, password });
    if (!('error' in result)) {
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    }
  };

  const serverError =
    error && 'data' in error
      ? (error.data as { message?: string })?.message ?? 'Reset failed'
      : null;

  const displayError = clientError || serverError;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">🔑</div>
          <h1 className="auth-title">Set new password</h1>
          <p className="auth-subtitle">
            {success ? 'Password updated! Redirecting to login…' : 'Choose a strong password'}
          </p>
        </div>

        {success ? (
          <div className="auth-success-box">
            <div className="auth-success-icon">✅</div>
            <p className="auth-success-text">
              Your password has been reset successfully. You'll be redirected to the login page in a moment.
            </p>
            <Link className="auth-submit-btn auth-submit-btn--outline" to="/login">
              Go to Sign In
            </Link>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            {displayError && (
              <div className="auth-error">{displayError}</div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="reset-password">New Password</label>
              <input
                id="reset-password"
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

            <div className="form-group">
              <label className="form-label" htmlFor="reset-confirm">Confirm Password</label>
              <input
                id="reset-confirm"
                className="form-input"
                type="password"
                placeholder="Repeat your new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
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
              {isLoading ? <span className="btn-spinner" /> : 'Reset Password'}
            </button>
          </form>
        )}

        {!success && (
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

export default ResetPasswordPage;
