import TodoForm from './TodoFrorm';
import TodoList from './TodoList';
import AppShell from './AppShell';

const TodoPage = () => (
  <AppShell>
    <TodoForm />
    <TodoList />
  </AppShell>
);

export default TodoPage;
