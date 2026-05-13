import { useState, useRef, useEffect } from 'react';
import { useUpdateTodoMutation, useDeleteTodoMutation } from '../store/api/todoApi';
import type { Todo } from '../types/todo.types';

interface TodoItemProps {
  todo: Todo;
}

const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const isThisYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(isThisYear ? {} : { year: 'numeric' }),
    hour: 'numeric',
    minute: '2-digit',
  });
};

const TodoItem = ({ todo }: TodoItemProps) => {
  const [updateTodo, { isLoading: isUpdating }] = useUpdateTodoMutation();
  const [deleteTodo, { isLoading: isDeleting }] = useDeleteTodoMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleToggle = () => {
    if (isUpdating || isDeleting || isEditing) return;
    updateTodo({ id: todo._id, completed: !todo.completed });
  };

  const handleDelete = () => {
    if (isUpdating || isDeleting) return;
    deleteTodo(todo._id);
  };

  const handleEditStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting || isUpdating) return;
    setEditText(todo.text);
    setIsEditing(true);
  };

  const handleEditSave = async () => {
    const trimmed = editText.trim();
    if (!trimmed) {
      setEditText(todo.text);
      setIsEditing(false);
      return;
    }
    if (trimmed !== todo.text) {
      await updateTodo({ id: todo._id, text: trimmed });
    }
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleEditSave();
    if (e.key === 'Escape') {
      setEditText(todo.text);
      setIsEditing(false);
    }
  };

  const wasEdited = todo.createdAt !== todo.updatedAt;

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''} ${isEditing ? 'todo-item--editing' : ''}`}>
      {isEditing ? (
        /* ── Edit Mode ── */
        <div className="todo-edit-wrapper">
          <input
            ref={inputRef}
            className="todo-edit-input"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleEditKeyDown}
            onBlur={handleEditSave}
            maxLength={500}
          />
          <div className="todo-edit-actions">
            <button
              className="todo-edit-save-btn"
              onClick={handleEditSave}
              disabled={isUpdating}
              aria-label="Save"
            >
              {isUpdating ? (
                <span className="btn-spinner-sm" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </button>
            <button
              className="todo-edit-cancel-btn"
              onClick={() => { setEditText(todo.text); setIsEditing(false); }}
              aria-label="Cancel"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      ) : (
        /* ── View Mode ── */
        <>
          <div className="todo-text-wrapper" onClick={handleToggle}>
            <div className="todo-checkbox">
              {isUpdating ? (
                <span className="btn-spinner-sm" />
              ) : (
                <svg viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </div>
            <div className="todo-content">
              <span className="todo-text">{todo.text}</span>
              <div className="todo-meta">
                <span className="todo-meta-item">
                  Created {formatDateTime(todo.createdAt)}
                </span>
                {wasEdited && (
                  <span className="todo-meta-item">
                    · Edited {formatDateTime(todo.updatedAt)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="todo-actions">
            {/* Edit button */}
            <button
              className="todo-edit-btn"
              onClick={handleEditStart}
              disabled={isDeleting || isUpdating}
              aria-label="Edit Todo"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>

            {/* Delete button */}
            <button
              className="todo-delete-btn"
              onClick={handleDelete}
              disabled={isDeleting || isUpdating}
              aria-label="Delete Todo"
            >
              {isDeleting ? (
                <span className="btn-spinner-sm danger" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TodoItem;