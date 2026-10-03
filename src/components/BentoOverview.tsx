import { Link } from 'react-router-dom';
import { useAppSelector } from '../store';
import { useGetTodosQuery } from '../store/api/todoApi';
import { useGetClipsQuery } from '../store/api/clipApi';

/**
 * Summary tile shown on the Todos page in the Bento layout.
 * Uses the same query args as TodoList's default view, so it shares that cache
 * entry instead of making an extra request.
 */
const BentoOverview = () => {
  const user = useAppSelector((s) => s.auth.user);
  const unreadCounts = useAppSelector((s) => s.chat.unreadCounts);
  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  const { data: todos } = useGetTodosQuery({ page: 1, limit: 5 });
  const { data: clips } = useGetClipsQuery();

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const stats = [
    { to: '/', value: todos?.total, label: todos?.total === 1 ? 'Todo' : 'Todos' },
    { to: '/clips', value: clips?.length, label: clips?.length === 1 ? 'Clip' : 'Clips' },
    { to: '/chat', value: totalUnread, label: 'Unread', highlight: totalUnread > 0 },
  ];

  return (
    <section className="bento-overview" aria-label="Overview">
      <div className="bento-overview-head">
        <span className="bento-overview-date">{today}</span>
        <h2 className="bento-overview-title">
          {user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Welcome back'}
        </h2>
      </div>
      <div className="bento-stats">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.to}
            className={`bento-stat ${stat.highlight ? 'bento-stat--highlight' : ''}`}
          >
            <span className="bento-stat-value">{stat.value ?? '–'}</span>
            <span className="bento-stat-label">{stat.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default BentoOverview;
