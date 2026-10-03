import TodoForm from './TodoFrorm';
import TodoList from './TodoList';
import AppShell from './AppShell';
import BentoOverview from './BentoOverview';
import { useTheme } from '../hooks/useTheme';

const TodoPage = () => {
  const { uiLayout } = useTheme();

  return (
    <AppShell>
      {uiLayout === 'bento' && <BentoOverview />}
      <TodoForm />
      <TodoList />
    </AppShell>
  );
};

export default TodoPage;
