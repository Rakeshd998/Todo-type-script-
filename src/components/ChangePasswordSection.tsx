import { useState } from 'react';
import { useChangePasswordMutation } from '../store/api/authApi';
import { getApiErrorMessage } from '../utils/apiError';

const MIN_LENGTH = 8;

/** Profile → Security: change password while logged in. */
const ChangePasswordSection = () => {
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const reset = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  const open = () => {
    reset();
    setSuccess('');
    setIsOpen(true);
  };

  const close = () => {
    reset();
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < MIN_LENGTH) {
      setError(`New password must be at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    const result = await changePassword({ currentPassword, newPassword });
    if ('error' in result) {
      setError(getApiErrorMessage(result.error, 'Could not change your password.'));
      return;
    }
    close();
    setSuccess('Password changed. You were signed out on all other devices.');
  };

  return (
    <div className="profile-section profile-section--security">
      <h3 className="profile-section-title">Security</h3>

      {success && <div className="profile-success" role="status">{success}</div>}

      {!isOpen ? (
        <div className="security-row">
          <div>
            <p className="security-row-title">Password</p>
            <p className="security-row-desc">Changing it signs you out on every other device.</p>
          </div>
          <button className="profile-inline-btn profile-inline-btn--boxed" onClick={open}>
            Change password
          </button>
        </div>
      ) : (
        <form className="password-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="current-password">Current password</label>
            <input
              id="current-password"
              className="form-input"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isLoading}
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="new-password">New password</label>
            <input
              id="new-password"
              className="form-input"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
              minLength={MIN_LENGTH}
              placeholder={`At least ${MIN_LENGTH} characters`}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="confirm-password">Confirm new password</label>
            <input
              id="confirm-password"
              className="form-input"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {error && <div className="auth-error" role="alert">{error}</div>}

          <div className="password-form-actions">
            <button type="button" className="modal-cancel-btn" onClick={close} disabled={isLoading}>
              Cancel
            </button>
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
            >
              {isLoading ? <span className="btn-spinner" /> : 'Update password'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ChangePasswordSection;
