import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import './styles/glass.css'; // after App.css so glass overrides win at equal specificity
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import TodoPage from './components/TodoPage';
import ClipPage from './components/ClipPage';
import ProfilePage from './components/ProfilePage';
import ChatPage from './components/ChatPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useRefreshTokenMutation } from './store/api/authApi';
import { useAppSelector } from './store';
import { useGetUnreadCountsQuery } from './store/api/chatApi';
import { useSocket } from './hooks/useSocket';

// Routes that don't need a valid session — skip the refresh splash for these
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

const App = () => {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const location = useLocation();

  const isPublicRoute = PUBLIC_ROUTES.some((r) => location.pathname.startsWith(r));
  const [initialized, setInitialized] = useState(isAuthenticated || isPublicRoute);

  const [refreshToken] = useRefreshTokenMutation();
  const didInit = useRef(false);

  // Initialise socket globally so chat notifications arrive on all pages
  useSocket();

  // Seed unread chat badges (shown on every page's Chat tab) from the server
  useGetUnreadCountsQuery(undefined, { skip: !isAuthenticated });

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    refreshToken()
      .unwrap()
      .catch(() => {})
      .finally(() => setInitialized(true));
  }, []);

  // The free backend sleeps when idle and can take ~a minute to wake —
  // tell the user instead of showing a silent spinner
  const [slowStart, setSlowStart] = useState(false);
  useEffect(() => {
    if (initialized) return;
    const timer = setTimeout(() => setSlowStart(true), 4000);
    return () => clearTimeout(timer);
  }, [initialized]);

  if (!initialized && !isPublicRoute) {
    return (
      <div className="splash-screen">
        <div className="splash-spinner" />
        {slowStart && (
          <p className="splash-hint">Waking up the server… this can take up to a minute after a period of inactivity.</p>
        )}
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login"                 element={<LoginPage />} />
      <Route path="/register"              element={<RegisterPage />} />
      <Route path="/forgot-password"       element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/"       element={<ProtectedRoute><TodoPage /></ProtectedRoute>} />
      <Route path="/clips"  element={<ProtectedRoute><ClipPage /></ProtectedRoute>} />
      <Route path="/chat"   element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="*"       element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;