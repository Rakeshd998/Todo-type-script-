import { useState } from 'react';
import { useAppSelector } from '../store';
import { useUpdateProfileMutation } from '../store/api/authApi';
import { getApiErrorMessage } from '../utils/apiError';

/** "Full Name" row of the Account Details card, editable inline. */
const EditNameField = () => {
  const user = useAppSelector((s) => s.auth.user);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const startEditing = () => {
    setName(user?.name ?? '');
    setError('');
    setIsEditing(true);
  };

  const cancel = () => {
    setIsEditing(false);
    setError('');
  };

  const save = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Name cannot be empty.');
      return;
    }
    if (trimmed === user?.name) {
      cancel();
      return;
    }
    const result = await updateProfile({ name: trimmed });
    if ('error' in result) {
      setError(getApiErrorMessage(result.error, 'Could not update your name.'));
    } else {
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <form className="profile-field profile-field--editing" onSubmit={save}>
        <label className="profile-field-label" htmlFor="profile-name-input">Full Name</label>
        <div className="profile-edit">
          <input
            id="profile-name-input"
            className="form-input profile-edit-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && cancel()}
            maxLength={100}
            autoFocus
            disabled={isLoading}
            aria-invalid={!!error}
            aria-describedby={error ? 'profile-name-error' : undefined}
          />
          <button type="submit" className="profile-edit-save" disabled={isLoading}>
            {isLoading ? <span className="btn-spinner-sm" /> : 'Save'}
          </button>
          <button type="button" className="profile-edit-cancel" onClick={cancel} disabled={isLoading}>
            Cancel
          </button>
        </div>
        {error && <p id="profile-name-error" className="profile-field-error">{error}</p>}
      </form>
    );
  }

  return (
    <div className="profile-field">
      <span className="profile-field-label">Full Name</span>
      <span className="profile-field-value profile-field-value--with-action">
        {user?.name || <em className="profile-empty-val">Not set</em>}
        <button className="profile-inline-btn" onClick={startEditing} aria-label="Edit full name">
          Edit
        </button>
      </span>
    </div>
  );
};

export default EditNameField;
