import { Link } from 'react-router-dom';
import { useAppSelector } from '../store';
import { useGetTodoStatsQuery } from '../store/api/todoApi';
import { useGetClipsQuery } from '../store/api/clipApi';
import { todayDateOnly } from '../utils/dates';

/**
 * Summary tile shown on the Todos page in the Bento layout. The due-date stats
 * share their cache entry with TodoList's filter chips (same `today` argument).
 */
const BentoOverview = () => {
  const user = useAppSelector((s) => s.auth.user);
  const unreadCounts = useAppSelector((s) => s.chat.unreadCounts);
  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  const { data: stats } = useGetTodoStatsQuery({ today: todayDateOnly() });
  const { data: clips } = useGetClipsQuery();

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const tiles = [
    { to: '/?due=today', value: stats?.dueToday, label: 'Due today', tone: stats?.dueToday ? 'accent' : '' },
    { to: '/?due=overdue', value: stats?.overdue, label: 'Overdue', tone: stats?.overdue ? 'alert' : '' },
    { to: '/clips', value: clips?.length, label: clips?.length === 1 ? 'Clip' : 'Clips', tone: '' },
    { to: '/chat', value: totalUnread, label: 'Unread', tone: totalUnread > 0 ? 'accent' : '' },
  ];

  const percentDone = stats && stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <section className="bento-overview" aria-label="Overview">
      <div className="bento-overview-head">
        <span className="bento-overview-date">{todayLabel}</span>
        <h2 className="bento-overview-title">
          {user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Welcome back'}
        </h2>
      </div>

      <div className="bento-stats">
        {tiles.map((tile) => (
          <Link
            key={tile.label}
            to={tile.to}
            className={`bento-stat ${tile.tone ? `bento-stat--${tile.tone}` : ''}`}
          >
            <span className="bento-stat-value">{tile.value ?? '–'}</span>
            <span className="bento-stat-label">{tile.label}</span>
          </Link>
        ))}
      </div>

      {stats && stats.total > 0 && (
        <div className="bento-progress">
          <div className="bento-progress-label">
            <span>{stats.completed} of {stats.total} done</span>
            <span>{percentDone}%</span>
          </div>
          <div
            className="bento-progress-track"
            role="progressbar"
            aria-valuenow={percentDone}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Todos completed"
          >
            <span className="bento-progress-fill" style={{ width: `${percentDone}%` }} />
          </div>
        </div>
      )}
    </section>
  );
};

export default BentoOverview;
