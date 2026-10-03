import type { TodoPriority } from '../types/todo.types';

const OPTIONS: { id: TodoPriority; label: string }[] = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Med' },
  { id: 'high', label: 'High' },
];

interface PriorityPickerProps {
  value: TodoPriority;
  onChange: (value: TodoPriority) => void;
  name: string; // unique per form so radio groups don't collide
  disabled?: boolean;
}

/** Compact Low / Med / High segmented control (native radios for keyboard + screen readers). */
const PriorityPicker = ({ value, onChange, name, disabled }: PriorityPickerProps) => (
  <div className="priority-picker" role="radiogroup" aria-label="Priority">
    {OPTIONS.map((option) => (
      <label
        key={option.id}
        className={`priority-option priority-option--${option.id} ${value === option.id ? 'priority-option--active' : ''}`}
        // Select explicitly: Chrome skips a label's "activate the radio" behaviour
        // while text is selected on the page (e.g. the todo editor pre-selects its text)
        onClick={() => !disabled && onChange(option.id)}
      >
        <input
          type="radio"
          name={name}
          className="visually-hidden"
          value={option.id}
          checked={value === option.id}
          onChange={() => onChange(option.id)}
          disabled={disabled}
        />
        <span className="priority-dot" aria-hidden="true" />
        {option.label}
      </label>
    ))}
  </div>
);

export default PriorityPicker;
