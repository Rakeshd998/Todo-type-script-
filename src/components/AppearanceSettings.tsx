import type { Theme, UiStyle } from '../hooks/useTheme';

interface AppearanceSettingsProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  uiStyle: UiStyle;
  setUiStyle: (style: UiStyle) => void;
}

const STYLE_OPTIONS: { id: UiStyle; name: string; description: string }[] = [
  { id: 'classic', name: 'Classic', description: 'Clean, solid surfaces' },
  { id: 'glass', name: 'Glass', description: 'Frosted, translucent panels' },
];

const MODE_OPTIONS: { id: Theme; name: string }[] = [
  { id: 'light', name: 'Light' },
  { id: 'dark', name: 'Dark' },
];

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AppearanceSettings = ({ theme, setTheme, uiStyle, setUiStyle }: AppearanceSettingsProps) => (
  <div className="appearance">
    {/* ── Style ── */}
    <fieldset className="appearance-group">
      <legend className="appearance-label">Style</legend>
      <div className="style-options">
        {STYLE_OPTIONS.map((option) => {
          const isActive = uiStyle === option.id;
          return (
            <label key={option.id} className={`style-option ${isActive ? 'style-option--active' : ''}`}>
              <input
                type="radio"
                name="ui-style"
                className="visually-hidden"
                value={option.id}
                checked={isActive}
                onChange={() => setUiStyle(option.id)}
              />
              <span className={`style-preview style-preview--${option.id}`} aria-hidden="true">
                <span className="style-preview-card">
                  <span className="style-preview-line" />
                  <span className="style-preview-line style-preview-line--short" />
                  <span className="style-preview-pill" />
                </span>
              </span>
              <span className="style-option-text">
                <span className="style-option-name">{option.name}</span>
                <span className="style-option-desc">{option.description}</span>
              </span>
              {isActive && (
                <span className="style-option-check" aria-hidden="true">
                  <CheckIcon />
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>

    {/* ── Mode ── */}
    <fieldset className="appearance-group">
      <legend className="appearance-label">Mode</legend>
      <div className="mode-switch">
        {MODE_OPTIONS.map((option) => (
          <label
            key={option.id}
            className={`mode-switch-option ${theme === option.id ? 'mode-switch-option--active' : ''}`}
          >
            <input
              type="radio"
              name="ui-mode"
              className="visually-hidden"
              value={option.id}
              checked={theme === option.id}
              onChange={() => setTheme(option.id)}
            />
            {option.name}
          </label>
        ))}
      </div>
    </fieldset>
  </div>
);

export default AppearanceSettings;
