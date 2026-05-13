import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store';
import { useLogoutMutation, useDeleteAccountMutation } from '../store/api/authApi';
import { useTheme } from '../hooks/useTheme';
import Footer from './Footer';
import GripLogo from './GripLogo';

const ProfilePage = () => {
  const user = useAppSelector((s) => s.auth.user);
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();
  const { theme, toggleTheme } = useTheme();

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
    <div className="app-container">
      {/* ── Header ── */}
      <div className="app-header">
        <GripLogo />
        <div className="app-user-bar">
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            )}
          </button>

          <button className="logout-btn" onClick={() => logout()} aria-label="Logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <nav className="page-tabs">
        <NavLink to="/" end className={({ isActive }) => `page-tab ${isActive ? 'page-tab--active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          Todos
        </NavLink>
        <NavLink to="/clips" className={({ isActive }) => `page-tab ${isActive ? 'page-tab--active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          Clipboard
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `page-tab ${isActive ? 'page-tab--active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          Profile
        </NavLink>
      </nav>

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
          <h3 className="profile-section-title">Preferences</h3>
          <p className="profile-coming-soon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            More settings coming soon…
          </p>
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

      <Footer />

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
    </div>
  );
};

export default ProfilePage;
