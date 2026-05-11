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

  const handleToggle = () => {
    if (isUpdating || isDeleting) return;
    updateTodo({ id: todo._id, completed: !todo.completed });
  };

  const handleDelete = () => {
    if (isUpdating || isDeleting) return;
    deleteTodo(todo._id);
  };

  const wasEdited = todo.createdAt !== todo.updatedAt;

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
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
  );
};

export default TodoItem;