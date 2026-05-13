import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useGetClipsQuery, useCreateClipMutation } from '../store/api/clipApi';
import { useAppSelector } from '../store';
import { useLogoutMutation } from '../store/api/authApi';
import { useTheme } from '../hooks/useTheme';
import ClipCard from './ClipCard';
import Footer from './Footer';
import GripLogo from './GripLogo';

const ClipPage = () => {
  const user = useAppSelector((s) => s.auth.user);
  const [logout] = useLogoutMutation();
  const { theme, toggleTheme } = useTheme();

  const { data: clips, isLoading, isError } = useGetClipsQuery();
  const [createClip, { isLoading: isCreating }] = useCreateClipMutation();

  const [showNewForm, setShowNewForm] = useState(false);
  const [newHeading, setNewHeading] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHeading.trim()) return;
    await createClip({ heading: newHeading.trim(), textToCopy: [] });
    setNewHeading('');
    setShowNewForm(false);
  };

  return (
    <div className="app-container">
      {/* ── Header ── */}
      <div className="app-header">
        <GripLogo />
        <div className="app-user-bar">
          {user?.name && <span className="user-greeting">Hi, {user.name}</span>}

          {/* Theme toggle */}
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

      {/* ── Clip page content ── */}
      <div className="clip-page">
        <div className="clip-page-header">
          <span className="result-count">{clips ? `${clips.length} clip${clips.length !== 1 ? 's' : ''}` : ''}</span>
          {!showNewForm && (
            <button className="new-clip-btn" onClick={() => setShowNewForm(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              New Clip
            </button>
          )}
        </div>

        {showNewForm && (
          <form className="new-clip-form" onSubmit={handleCreate}>
            <input
              className="form-input"
              type="text"
              placeholder="Clip heading (e.g. SSH Commands)"
              value={newHeading}
              onChange={(e) => setNewHeading(e.target.value)}
              autoFocus
            />
            <div className="new-clip-form-actions">
              <button className="auth-submit-btn" type="submit" disabled={isCreating || !newHeading.trim()} style={{ flex: 1, padding: '10px' }}>
                {isCreating ? <span className="btn-spinner" /> : 'Create'}
              </button>
              <button type="button" className="new-clip-cancel-btn" onClick={() => { setShowNewForm(false); setNewHeading(''); }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="empty-state"><div className="loading-spinner" /><p>Loading clips...</p></div>
        ) : isError ? (
          <div className="empty-state error-state"><p>Failed to load clips.</p></div>
        ) : !clips || clips.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <p>No clips yet. Create one above!</p>
          </div>
        ) : (
          <div className="clip-grid">
            {clips.map((clip) => (
              <ClipCard key={clip._id} clip={clip} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ClipPage;
