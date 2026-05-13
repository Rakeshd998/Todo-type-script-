import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import TodoPage from './components/TodoPage';
import ClipPage from './components/ClipPage';
import ProfilePage from './components/ProfilePage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useRefreshTokenMutation } from './store/api/authApi';
import { useAppSelector } from './store';

// Routes that don't need a valid session — skip the refresh splash for these
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

const App = () => {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const location = useLocation();

  // Skip the splash screen if we're already on a public route (e.g. /reset-password/:token).
  // Otherwise, show it only for un-authenticated sessions while the refresh check runs.
  const isPublicRoute = PUBLIC_ROUTES.some((r) => location.pathname.startsWith(r));
  const [initialized, setInitialized] = useState(isAuthenticated || isPublicRoute);

  const [refreshToken] = useRefreshTokenMutation();

  // Guard against React StrictMode's intentional double-mount in development,
  // which fires two simultaneous refresh requests causing a 403 on the second.
  const didInit = useRef(false);

  // Apply saved theme on first render
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', saved ?? preferred);
  }, []);

  useEffect(() => {
    if (didInit.current) return; // already called — skip StrictMode's second mount
    didInit.current = true;

    // Refresh in background: gets fresh token, rotates cookie, restores user info
    refreshToken()
      .unwrap()
      .catch(() => {
        // Refresh failed — cookie expired or missing.
        // clearCredentials (incl. localStorage) is dispatched by onQueryStarted's catch.
      })
      .finally(() => setInitialized(true));
  }, []);

  // Show splash only for protected routes while refresh is in-flight
  if (!initialized && !isPublicRoute) {
    return (
      <div className="splash-screen">
        <div className="splash-spinner" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login"               element={<LoginPage />} />
      <Route path="/register"            element={<RegisterPage />} />
      <Route path="/forgot-password"     element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/"       element={<ProtectedRoute><TodoPage /></ProtectedRoute>} />
      <Route path="/clips"  element={<ProtectedRoute><ClipPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="*"       element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;