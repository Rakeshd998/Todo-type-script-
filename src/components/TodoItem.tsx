import { useState, useRef, useEffect } from 'react';
import { useUpdateTodoMutation, useDeleteTodoMutation, type TodoFields } from '../store/api/todoApi';
import { useAppDispatch } from '../store';
import { showToast } from '../store/slices/toastSlice';
import type { Todo, TodoPriority } from '../types/todo.types';
import { formatDueDate, getDueStatus } from '../utils/dates';
import PriorityPicker from './PriorityPicker';

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

const DUE_LABELS = { overdue: 'Overdue', today: 'Due today', tomorrow: 'Due tomorrow' } as const;

const truncate = (text: string, max = 40) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

const TodoItem = ({ todo }: TodoItemProps) => {
  const dispatch = useAppDispatch();
  const [updateTodo, { isLoading: isUpdating }] = useUpdateTodoMutation();
  const [deleteTodo, { isLoading: isDeleting }] = useDeleteTodoMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editDueDate, setEditDueDate] = useState(todo.dueDate ?? '');
  const [editPriority, setEditPriority] = useState<TodoPriority>(todo.priority);
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

  // Deleting moves the todo to the server's trash; the toast offers Undo
  const handleDelete = async () => {
    if (isUpdating || isDeleting) return;
    const result = await deleteTodo(todo._id);
    if ('error' in result) {
      dispatch(showToast({ message: 'Could not delete the todo. Please try again.', tone: 'error' }));
      return;
    }
    dispatch(
      showToast({
        message: `Deleted “${truncate(todo.text)}”`,
        undo: { kind: 'restore-todo', todoId: todo._id },
      }),
    );
  };

  const handleEditStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting || isUpdating) return;
    setEditText(todo.text);
    setEditDueDate(todo.dueDate ?? '');
    setEditPriority(todo.priority);
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  const handleEditSave = async () => {
    const trimmed = editText.trim();
    if (!trimmed) {
      handleEditCancel();
      return;
    }
    // Send only what changed
    const changes: TodoFields = {};
    if (trimmed !== todo.text) changes.text = trimmed;
    if ((editDueDate || null) !== todo.dueDate) changes.dueDate = editDueDate || null;
    if (editPriority !== todo.priority) changes.priority = editPriority;

    if (Object.keys(changes).length > 0) {
      await updateTodo({ id: todo._id, ...changes });
    }
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleEditSave();
    if (e.key === 'Escape') handleEditCancel();
  };

  // Clicking a non-focusable part of the editor (e.g. a priority label) briefly
  // moves focus to <body>. Remember that a click inside the editor is in progress
  // so that blur isn't mistaken for "left the editor".
  const pointerInEditor = useRef(false);

  const handleEditorMouseDown = () => {
    pointerInEditor.current = true;
    // Reset after the click completes (also if the pointer is released outside)
    window.addEventListener('mouseup', () => setTimeout(() => { pointerInEditor.current = false; }, 0), { once: true });
  };

  // After a label click focus is left on <body>; return it to the text field so
  // Enter still saves and clicking outside still triggers save-on-blur
  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(document.activeElement)) inputRef.current?.focus();
  };

  // Save when focus leaves the whole edit area, not when moving between its
  // own fields (text -> date -> priority)
  const handleEditBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (pointerInEditor.current) return;
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) handleEditSave();
  };

  const dueStatus = todo.dueDate ? getDueStatus(todo.dueDate) : null;
  const showDueWarning = dueStatus !== null && !todo.completed;

  const wasEdited = todo.createdAt !== todo.updatedAt;

  return (
    <div
      className={[
        'todo-item',
        todo.completed ? 'completed' : '',
        isEditing ? 'todo-item--editing' : '',
        `todo-item--priority-${todo.priority}`,
        showDueWarning && dueStatus === 'overdue' ? 'todo-item--overdue' : '',
      ].filter(Boolean).join(' ')}
    >
      {isEditing ? (
        /* ── Edit Mode ── */
        <div
          className="todo-edit-wrapper"
          onBlur={handleEditBlur}
          onMouseDown={handleEditorMouseDown}
          onClick={handleEditorClick}
        >
          <div className="todo-edit-fields">
            <input
              ref={inputRef}
              className="todo-edit-input"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleEditKeyDown}
              maxLength={500}
              aria-label="Todo text"
            />
            <div className="todo-edit-options">
              <input
                type="date"
                className="due-date-input due-date-input--boxed"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                onKeyDown={handleEditKeyDown}
                aria-label="Due date"
              />
              <PriorityPicker
                value={editPriority}
                onChange={setEditPriority}
                name={`priority-${todo._id}`}
              />
            </div>
          </div>
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
              onClick={handleEditCancel}
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
                {todo.dueDate && (
                  <span
                    className={`due-badge due-badge--${todo.completed ? 'done' : dueStatus}`}
                    title={`Due ${formatDueDate(todo.dueDate)}`}
                  >
                    {showDueWarning && dueStatus !== 'upcoming'
                      ? DUE_LABELS[dueStatus as keyof typeof DUE_LABELS]
                      : `Due ${formatDueDate(todo.dueDate)}`}
                  </span>
                )}
                {todo.priority !== 'medium' && (
                  <span className={`priority-badge priority-badge--${todo.priority}`}>
                    {todo.priority === 'high' ? 'High' : 'Low'}
                  </span>
                )}
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