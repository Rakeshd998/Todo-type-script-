import { useState } from 'react';
import { useGetClipsQuery, useCreateClipMutation } from '../store/api/clipApi';
import ClipCard from './ClipCard';
import AppShell from './AppShell';

const ClipPage = () => {
  const { data: clips, isLoading, isError } = useGetClipsQuery();
  const [createClip, { isLoading: isCreating }] = useCreateClipMutation();

  const [showNewForm, setShowNewForm] = useState(false);
  const [newHeading, setNewHeading] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHeading.trim()) return;
    await createClip({ heading: newHeading.trim(), textToCopy: [] });
    setNewHeading('');
    setShowNewForm(false);
  };

  return (
    <AppShell>

      {/* ── Clip page content ── */}
      <div className="clip-page">
        <div className="clip-page-header">
          <span className="result-count">{clips ? `${clips.length} clip${clips.length !== 1 ? 's' : ''}` : ''}</span>
          {!showNewForm && (
            <button className="new-clip-btn" onClick={() => setShowNewForm(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              New Clip
            </button>
          )}
        </div>

        {showNewForm && (
          <form className="new-clip-form" onSubmit={handleCreate}>
            <input
              className="form-input"
              type="text"
              placeholder="Clip heading (e.g. SSH Commands)"
              value={newHeading}
              onChange={(e) => setNewHeading(e.target.value)}
              autoFocus
            />
            <div className="new-clip-form-actions">
              <button className="auth-submit-btn" type="submit" disabled={isCreating || !newHeading.trim()} style={{ flex: 1, padding: '10px' }}>
                {isCreating ? <span className="btn-spinner" /> : 'Create'}
              </button>
              <button type="button" className="new-clip-cancel-btn" onClick={() => { setShowNewForm(false); setNewHeading(''); }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="empty-state"><div className="loading-spinner" /><p>Loading clips...</p></div>
        ) : isError ? (
          <div className="empty-state error-state"><p>Failed to load clips.</p></div>
        ) : !clips || clips.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <p>No clips yet. Create one above!</p>
          </div>
        ) : (
          <div className="clip-grid">
            {clips.map((clip) => (
              <ClipCard key={clip._id} clip={clip} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default ClipPage;
