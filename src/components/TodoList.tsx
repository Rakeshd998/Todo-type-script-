import { useState, useEffect } from 'react';
import { useGetTodosQuery } from '../store/api/todoApi';
import TodoItem from './TodoItem';

const LIMIT = 5;

const getPageNumbers = (current: number, total: number): number[] => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const start = Math.max(1, Math.min(current - 2, total - 4));
  return Array.from({ length: 5 }, (_, i) => start + i);
};

const TodoList = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  // Toggle states for the icon buttons
  const [showSearch, setShowSearch] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when date filters change
  useEffect(() => { setPage(1); }, [startDate, endDate]);

  // Clear search value when panel is closed
  useEffect(() => {
    if (!showSearch) { setSearch(''); }
  }, [showSearch]);

  // Clear date values when panel is closed
  useEffect(() => {
    if (!showDateFilter) { setStartDate(''); setEndDate(''); }
  }, [showDateFilter]);

  const queryParams = {
    page,
    limit: LIMIT,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  };

  const { data, isLoading, isError, isFetching } = useGetTodosQuery(queryParams);

  // If deleting the last item on a page causes empty results, go back one page
  useEffect(() => {
    if (data && data.todos.length === 0 && page > 1) setPage((p) => p - 1);
  }, [data, page]);

  const hasDateFilter = startDate || endDate;
  const isSearchActive = showSearch || !!debouncedSearch;
  const isDateActive = showDateFilter || !!hasDateFilter;

  return (
    <div className="todo-list-wrapper">

      {/* ── Toolbar: count + icon toggle buttons ── */}
      <div className="list-toolbar">
        <span className="result-count">
          {isFetching && <span className="fetching-dot" />}
          {data
            ? `${data.total} ${data.total === 1 ? 'todo' : 'todos'}${debouncedSearch || hasDateFilter ? ' found' : ''}`
            : !isLoading && !isError
            ? '0 todos'
            : ''}
        </span>

        <div className="toolbar-actions">
          {/* Search icon toggle */}
          <button
            className={`toolbar-icon-btn ${isSearchActive ? 'toolbar-icon-btn--active' : ''}`}
            onClick={() => setShowSearch((s) => !s)}
            title="Search todos"
            aria-label="Toggle search"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>

          {/* Calendar / date filter icon toggle */}
          <button
            className={`toolbar-icon-btn ${isDateActive ? 'toolbar-icon-btn--active' : ''}`}
            onClick={() => setShowDateFilter((d) => !d)}
            title="Filter by date"
            aria-label="Toggle date filter"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Expandable search panel ── */}
      {showSearch && (
        <div className="search-wrapper">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            className="search-input"
            type="text"
            placeholder="Search todos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          {search && (
            <button className="search-clear-btn" onClick={() => setSearch('')} aria-label="Clear search">✕</button>
          )}
        </div>
      )}

      {/* ── Expandable date filter panel ── */}
      {showDateFilter && (
        <div className="filter-row">
          <div className="date-filter-group">
            <label className="date-label">From</label>
            <input
              className="date-input"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate || undefined}
            />
          </div>
          <div className="date-filter-group">
            <label className="date-label">To</label>
            <input
              className="date-input"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || undefined}
            />
          </div>
          {hasDateFilter && (
            <button className="clear-filter-btn" onClick={() => { setStartDate(''); setEndDate(''); }}>
              Clear
            </button>
          )}
        </div>
      )}

      {/* ── Todo list / states ── */}
      {isLoading ? (
        <div className="empty-state">
          <div className="loading-spinner" />
          <p>Loading your todos...</p>
        </div>
      ) : isError ? (
        <div className="empty-state error-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>Failed to load todos.</p>
        </div>
      ) : !data || data.todos.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          <p>{debouncedSearch || hasDateFilter ? 'No todos match your filters.' : "You're all caught up!"}</p>
        </div>
      ) : (
        <>
          <div className={`todo-list ${isFetching ? 'list-fading' : ''}`}>
            {data.todos.map((todo) => (
              <TodoItem key={todo._id} todo={todo} />
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                aria-label="Previous page"
              >
                ‹
              </button>
              {getPageNumbers(page, data.totalPages).map((num) => (
                <button
                  key={num}
                  className={`page-btn ${num === page ? 'active' : ''}`}
                  onClick={() => setPage(num)}
                >
                  {num}
                </button>
              ))}
              <button
                className="page-btn"
                onClick={() => setPage((p) => p + 1)}
                disabled={page === data.totalPages}
                aria-label="Next page"
              >
                ›
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TodoList;