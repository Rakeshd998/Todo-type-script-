import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { dismissToast, showToast, type ToastState } from '../store/slices/toastSlice';
import { useRestoreTodoMutation } from '../store/api/todoApi';

// Long enough to react, well inside the server's ~60s restore window
const TOAST_DURATION_MS = 6000;

const ToastView = ({ toast }: { toast: ToastState }) => {
  const dispatch = useAppDispatch();
  const [restoreTodo, { isLoading: isRestoring }] = useRestoreTodoMutation();
  const [paused, setPaused] = useState(false);

  // Auto-dismiss; hovering or focusing the toast pauses the timer
  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => dispatch(dismissToast(toast.id)), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast.id, paused, dispatch]);

  const handleUndo = async () => {
    if (toast.undo?.kind !== 'restore-todo') return;
    const result = await restoreTodo(toast.undo.todoId);
    if ('error' in result) {
      dispatch(showToast({ message: 'Too late — that todo can no longer be restored.', tone: 'error' }));
    } else {
      dispatch(dismissToast(toast.id));
    }
  };

  return (
    <div
      className={`toast toast--${toast.tone}`}
      role="status"
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span className="toast-message">{toast.message}</span>
      {toast.undo && (
        <button className="toast-action" onClick={handleUndo} disabled={isRestoring}>
          {isRestoring ? <span className="btn-spinner-sm" /> : 'Undo'}
        </button>
      )}
      <button
        className="toast-close"
        onClick={() => dispatch(dismissToast(toast.id))}
        aria-label="Dismiss notification"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      {!paused && (
        <span
          className="toast-progress"
          style={{ animationDuration: `${TOAST_DURATION_MS}ms` }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

/** Undo/notification toast. Keyed by id so each toast starts with fresh state
 *  (e.g. a toast dismissed while hovered/focused doesn't leave the next one paused). */
const Toast = () => {
  const toast = useAppSelector((s) => s.toast.current);
  return toast ? <ToastView key={toast.id} toast={toast} /> : null;
};

export default Toast;
