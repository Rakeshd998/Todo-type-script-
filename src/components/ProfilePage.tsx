import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store';
import { useDeleteAccountMutation } from '../store/api/authApi';
import AppShell from './AppShell';
import AppearanceSettings from './AppearanceSettings';

const ProfilePage = () => {
  const user = useAppSelector((s) => s.auth.user);
  const navigate = useNavigate();
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?';

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';

  const handleDeleteAccount = async () => {
    setDeleteError('');
    if (confirmEmail !== user?.email) {
      setDeleteError('Email does not match. Please type your exact email address.');
      return;
    }
    const result = await deleteAccount();
    if (!('error' in result)) {
      navigate('/register', { replace: true });
    } else {
      setDeleteError('Failed to delete account. Please try again.');
    }
  };

  const openDeleteModal = () => {
    setConfirmEmail('');
    setDeleteError('');
    setShowDeleteModal(true);
  };

  return (
    <AppShell>

      {/* ── Profile Content ── */}
      <div className="profile-page">
        {/* Avatar + Name */}
        <div className="profile-hero">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-hero-info">
            <h2 className="profile-name">{user?.name || 'Anonymous'}</h2>
            <p className="profile-email">{user?.email}</p>
            <span className="profile-badge">Member since {joinedDate}</span>
          </div>
        </div>

        {/* Info Cards */}
        <div className="profile-section">
          <h3 className="profile-section-title">Account Details</h3>
          <div className="profile-fields">
            <div className="profile-field">
              <span className="profile-field-label">Full Name</span>
              <span className="profile-field-value">{user?.name || <em className="profile-empty-val">Not set</em>}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Email Address</span>
              <span className="profile-field-value">{user?.email}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Member Since</span>
              <span className="profile-field-value">{joinedDate}</span>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="profile-section">
          <h3 className="profile-section-title">Appearance</h3>
          <AppearanceSettings />
        </div>

        {/* ── Danger Zone ── */}
        <div className="profile-section profile-danger-zone">
          <h3 className="profile-section-title profile-danger-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            Danger Zone
          </h3>
          <p className="profile-danger-desc">
            Once you delete your account, all your todos and clipboard items will be permanently removed. This action cannot be undone.
          </p>
          <button
            id="delete-account-btn"
            className="danger-btn"
            onClick={openDeleteModal}
          >
            Delete My Account
          </button>
        </div>
      </div>


      {/* ── Delete Confirmation Modal ── */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-card danger-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon danger-modal-icon">⚠️</div>
            <h2 className="modal-title">Delete account?</h2>
            <p className="modal-desc">
              This will permanently delete your account, all your todos, and clipboard items.
              <strong> This cannot be undone.</strong>
            </p>

            <div className="modal-confirm-label">
              Type your email address to confirm:
              <span className="modal-confirm-email"> {user?.email}</span>
            </div>
            <input
              id="delete-confirm-email"
              className="form-input modal-confirm-input"
              type="email"
              placeholder={user?.email}
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              autoComplete="off"
            />

            {deleteError && <div className="auth-error modal-error">{deleteError}</div>}

            <div className="modal-actions">
              <button
                className="modal-cancel-btn"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                id="confirm-delete-btn"
                className="danger-btn"
                onClick={handleDeleteAccount}
                disabled={isDeleting || confirmEmail !== user?.email}
              >
                {isDeleting ? <span className="btn-spinner" /> : 'Yes, Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default ProfilePage;
