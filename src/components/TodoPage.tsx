import { NavLink } from 'react-router-dom';
import TodoForm from './TodoFrorm';
import TodoList from './TodoList';
import Footer from './Footer';
import { useAppSelector } from '../store';
import { useLogoutMutation } from '../store/api/authApi';

const TodoPage = () => {
  const user = useAppSelector((s) => s.auth.user);
  const [logout] = useLogoutMutation();

  return (
    <div className="app-container">
      {/* ── Header ── */}
      <div className="app-header">
        <h1 className="app-title">Workspace</h1>
        <div className="app-user-bar">
          {user?.name && <span className="user-greeting">Hi, {user.name}</span>}
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
      </nav>

      {/* ── Todo content ── */}
      <TodoForm />
      <TodoList />
      <Footer />
    </div>
  );
};

export default TodoPage;
