import type { ReactNode } from 'react';
import { useTheme, type Theme, type UiLayout, type UiStyle } from '../hooks/useTheme';

const STYLE_OPTIONS: { id: UiStyle; name: string; description: string }[] = [
  { id: 'classic', name: 'Classic', description: 'Clean, solid surfaces' },
  { id: 'glass', name: 'Glass', description: 'Frosted, translucent panels' },
  { id: 'tactile', name: 'Tactile', description: 'Bold borders, calm space' },
];

const LAYOUT_OPTIONS: { id: UiLayout; name: string; description: string }[] = [
  { id: 'focused', name: 'Focused', description: 'Single centred column' },
  { id: 'wide', name: 'Wide', description: 'More room, clips in a grid' },
  { id: 'sidebar', name: 'Sidebar', description: 'Navigation on the left' },
  { id: 'bento', name: 'Bento', description: 'Dashboard of tiles' },
];

const MODE_OPTIONS: { id: Theme; name: string }[] = [
  { id: 'light', name: 'Light' },
  { id: 'dark', name: 'Dark' },
];

const CheckIcon = () => (
  <span className="style-option-check" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  </span>
);

// Mini wireframe of each layout
const LayoutPreview = ({ layout }: { layout: UiLayout }) => (
  <span className={`layout-preview layout-preview--${layout}`} aria-hidden="true">
    <span className="layout-preview-frame">
      {layout !== 'bento' && <span className="layout-preview-header" />}
      {layout === 'bento' ? (
        <span className="layout-preview-bento">
          <span className="layout-preview-tile layout-preview-tile--wide" />
          <span className="layout-preview-tile layout-preview-tile--accent" />
          <span className="layout-preview-tile layout-preview-tile--tall" />
          <span className="layout-preview-tile" />
          <span className="layout-preview-tile" />
        </span>
      ) : layout === 'sidebar' ? (
        <span className="layout-preview-body">
          <span className="layout-preview-nav layout-preview-nav--vertical" />
          <span className="layout-preview-content" />
        </span>
      ) : (
        <>
          <span className="layout-preview-nav" />
          <span className="layout-preview-content" />
        </>
      )}
    </span>
  </span>
);

interface OptionCardProps {
  name: string;
  group: string;
  value: string;
  title: string;
  description: string;
  checked: boolean;
  onSelect: () => void;
  preview: ReactNode;
}

const OptionCard = ({ name, group, value, title, description, checked, onSelect, preview }: OptionCardProps) => (
  <label className={`style-option ${checked ? 'style-option--active' : ''}`}>
    <input
      type="radio"
      name={group}
      className="visually-hidden"
      value={value}
      checked={checked}
      onChange={onSelect}
      aria-label={name}
    />
    {preview}
    <span className="style-option-text">
      <span className="style-option-name">{title}</span>
      <span className="style-option-desc">{description}</span>
    </span>
    {checked && <CheckIcon />}
  </label>
);

const AppearanceSettings = () => {
  const { theme, setTheme, uiStyle, setUiStyle, uiLayout, setUiLayout } = useTheme();

  return (
    <div className="appearance">
      {/* ── Style ── */}
      <fieldset className="appearance-group">
        <legend className="appearance-label">Style</legend>
        <div className="style-options">
          {STYLE_OPTIONS.map((option) => (
            <OptionCard
              key={option.id}
              name={`${option.name} style`}
              group="ui-style"
              value={option.id}
              title={option.name}
              description={option.description}
              checked={uiStyle === option.id}
              onSelect={() => setUiStyle(option.id)}
              preview={
                <span className={`style-preview style-preview--${option.id}`} aria-hidden="true">
                  <span className="style-preview-card">
                    <span className="style-preview-line" />
                    <span className="style-preview-line style-preview-line--short" />
                    <span className="style-preview-pill" />
                  </span>
                </span>
              }
            />
          ))}
        </div>
      </fieldset>

      {/* ── Layout ── */}
      <fieldset className="appearance-group">
        <legend className="appearance-label">Layout</legend>
        <div className="style-options">
          {LAYOUT_OPTIONS.map((option) => (
            <OptionCard
              key={option.id}
              name={`${option.name} layout`}
              group="ui-layout"
              value={option.id}
              title={option.name}
              description={option.description}
              checked={uiLayout === option.id}
              onSelect={() => setUiLayout(option.id)}
              preview={<LayoutPreview layout={option.id} />}
            />
          ))}
        </div>
        <p className="appearance-note">On small screens every layout uses the single-column view.</p>
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
};

export default AppearanceSettings;
