import { useState } from 'react';
import { useCreateTodoMutation } from '../store/api/todoApi';
import type { TodoPriority } from '../types/todo.types';
import { todayDateOnly } from '../utils/dates';
import PriorityPicker from './PriorityPicker';

const TodoForm = () => {
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TodoPriority>('medium');
  const [createTodo, { isLoading }] = useCreateTodoMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim()) return;
    const result = await createTodo({ text: text.trim(), dueDate: dueDate || null, priority });
    if (!('error' in result)) {
      setText('');
      setDueDate('');
      setPriority('medium');
    }
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <div className="todo-form-row">
        <input
          className="todo-input"
          autoFocus
          type="text"
          placeholder="What needs to be done?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
          maxLength={500}
          aria-label="New todo"
        />
        <button
          className="todo-add-btn"
          type="submit"
          disabled={isLoading}
          aria-label="Add Todo"
        >
          {isLoading ? (
            <span className="btn-spinner-sm" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          )}
        </button>
      </div>

      <div className="todo-form-options">
        <div className={`due-date-field ${dueDate ? 'due-date-field--set' : ''}`}>
          <label className="due-date-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="visually-hidden">Due date</span>
            <input
              type="date"
              className="due-date-input"
              value={dueDate}
              min={todayDateOnly()}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isLoading}
            />
          </label>
          {dueDate && (
            <button
              type="button"
              className="due-date-clear"
              onClick={() => setDueDate('')}
              aria-label="Clear due date"
            >
              ✕
            </button>
          )}
        </div>
        <PriorityPicker value={priority} onChange={setPriority} name="new-todo-priority" disabled={isLoading} />
      </div>
    </form>
  );
};

export default TodoForm;
