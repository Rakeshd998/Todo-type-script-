import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppSelector } from '../store';
import { useLogoutMutation } from '../store/api/authApi';
import { useTheme } from '../hooks/useTheme';
import GripLogo from './GripLogo';
import Footer from './Footer';

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `page-tab ${isActive ? 'page-tab--active' : ''}`;

/**
 * Shared frame for all signed-in pages: header, tab navigation, content, footer.
 * The arrangement (focused / wide / sidebar) is controlled purely by CSS via
 * <html data-layout="…">, so pages only provide their content.
 */
const AppShell = ({ children }: { children: ReactNode }) => {
  const user = useAppSelector((s) => s.auth.user);
  const unreadCounts = useAppSelector((s) => s.chat.unreadCounts);
  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);
  const [logout] = useLogoutMutation();
  const { theme, toggleTheme } = useTheme();

  const nextTheme = theme === 'light' ? 'dark' : 'light';

  return (
    <div className="app-container">
      {/* ── Header ── */}
      <div className="app-header">
        <GripLogo />
        <div className="app-user-bar">
          {user?.name && <span className="user-greeting">Hi, {user.name}</span>}

          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${nextTheme} mode`}
            title={`Switch to ${nextTheme} mode`}
          >
            {theme === 'light' ? (
              /* Moon icon */
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              /* Sun icon */
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>

          <button className="logout-btn" onClick={() => logout()} aria-label="Logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <nav className="page-tabs" aria-label="Main">
        <NavLink to="/" end className={tabClass}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          Todos
        </NavLink>
        <NavLink to="/clips" className={tabClass}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Clipboard
        </NavLink>
        <NavLink to="/chat" className={tabClass}>
          <span className="chat-tab-inner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Chat
            {totalUnread > 0 && (
              <span className="unread-badge">{totalUnread > 99 ? '99+' : totalUnread}</span>
            )}
          </span>
        </NavLink>
        <NavLink to="/profile" className={tabClass}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Profile
        </NavLink>
      </nav>

      {/* ── Page content ── */}
      <main className="page-content">{children}</main>

      <Footer />
    </div>
  );
};

export default AppShell;
