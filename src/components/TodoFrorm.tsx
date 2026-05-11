import { useState } from 'react';
import { useCreateTodoMutation } from '../store/api/todoApi';

const TodoForm = () => {
  const [text, setText] = useState('');
  const [createTodo, { isLoading }] = useCreateTodoMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim()) return;
    await createTodo({ text: text.trim() });
    setText('');
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <input
        className="todo-input"
        autoFocus
        type="text"
        placeholder="What needs to be done?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isLoading}
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
    </form>
  );
};

export default TodoForm;