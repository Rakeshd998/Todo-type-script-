import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import TodoPage from './components/TodoPage';
import ClipPage from './components/ClipPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useRefreshTokenMutation } from './store/api/authApi';
import { useAppSelector } from './store';

const App = () => {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  // If a token exists in localStorage, isAuthenticated is already true —
  // no need to show a splash screen. Only show it for fresh (unauthenticated) sessions.
  const [initialized, setInitialized] = useState(isAuthenticated);

  const [refreshToken] = useRefreshTokenMutation();

  // Guard against React StrictMode's intentional double-mount in development,
  // which fires two simultaneous refresh requests causing a 403 on the second.
  const didInit = useRef(false);

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

  // Show splash only for users with no stored session (first visit or after logout)
  if (!initialized) {
    return (
      <div className="splash-screen">
        <div className="splash-spinner" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<ProtectedRoute><TodoPage /></ProtectedRoute>} />
      <Route path="/clips" element={<ProtectedRoute><ClipPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;