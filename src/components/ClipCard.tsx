import { useState } from 'react';
import type { Clip } from '../types/clip.types';
import { useUpdateClipMutation, useDeleteClipMutation } from '../store/api/clipApi';

interface ClipCardProps {
  clip: Clip;
}

const ClipCard = ({ clip }: ClipCardProps) => {
  const [updateClip, { isLoading: isSaving }] = useUpdateClipMutation();
  const [deleteClip, { isLoading: isDeleting }] = useDeleteClipMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [editHeading, setEditHeading] = useState(clip.heading);
  const [newText, setNewText] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // ── Copy to clipboard ────────────────────────────────────────
  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  // ── Remove a single text item ────────────────────────────────
  const handleRemoveText = (index: number) => {
    const updated = clip.textToCopy.filter((_, i) => i !== index);
    updateClip({ id: clip._id, textToCopy: updated });
  };

  // ── Add a new text item ──────────────────────────────────────
  const handleAddText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    await updateClip({ id: clip._id, textToCopy: [...clip.textToCopy, newText.trim()] });
    setNewText('');
  };

  // ── Save heading edit ────────────────────────────────────────
  const handleSaveHeading = async () => {
    if (editHeading.trim() && editHeading.trim() !== clip.heading) {
      await updateClip({ id: clip._id, heading: editHeading.trim() });
    }
    setIsEditing(false);
  };

  return (
    <div className="clip-card">
      {/* ── Header ── */}
      <div className="clip-card-header">
        {isEditing ? (
          <input
            className="clip-heading-input"
            value={editHeading}
            onChange={(e) => setEditHeading(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveHeading(); if (e.key === 'Escape') setIsEditing(false); }}
            autoFocus
          />
        ) : (
          <h3 className="clip-heading">{clip.heading}</h3>
        )}

        <div className="clip-card-actions">
          {isEditing ? (
            <button className="clip-action-btn clip-action-btn--save" onClick={handleSaveHeading} disabled={isSaving}>
              {isSaving ? <span className="btn-spinner-sm" /> : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </button>
          ) : (
            <button className="clip-action-btn" onClick={() => { setEditHeading(clip.heading); setIsEditing(true); }} title="Edit heading">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          )}
          <button className="clip-action-btn clip-action-btn--danger" onClick={() => deleteClip(clip._id)} disabled={isDeleting} title="Delete clip">
            {isDeleting ? <span className="btn-spinner-sm danger" /> : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Text items ── */}
      <div className="clip-items">
        {clip.textToCopy.length === 0 && (
          <p className="clip-empty">No items yet — add one below.</p>
        )}
        {clip.textToCopy.map((text, i) => (
          <div key={i} className="clip-text-row">
            <span className="clip-text-content">{text}</span>
            <div className="clip-text-actions">
              {/* Copy button */}
              <button
                className={`clip-copy-btn ${copiedIndex === i ? 'clip-copy-btn--copied' : ''}`}
                onClick={() => handleCopy(text, i)}
                title="Copy to clipboard"
              >
                {copiedIndex === i ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                )}
              </button>
              {/* Delete single text item */}
              <button
                className="clip-text-delete-btn"
                onClick={() => handleRemoveText(i)}
                title="Remove this item"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Add text row ── */}
      <form className="clip-add-text-form" onSubmit={handleAddText}>
        <input
          className="clip-add-text-input"
          type="text"
          placeholder="Add text snippet..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
        />
        <button className="clip-add-text-btn" type="submit" disabled={isSaving || !newText.trim()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ClipCard;
