/**
 * GripLogo — V2 inline header logo (G lettermark + "Grip" wordmark).
 * Uses an SVG "G" ring with purple→teal gradient alongside the bold "Grip" text.
 */
const GripLogo = () => (
  <div className="grip-logo">
    {/* V2 G-lettermark icon */}
    <svg
      className="grip-logo-icon"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="grip-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      {/* Outer ring */}
      <circle cx="20" cy="20" r="17" stroke="url(#grip-grad)" strokeWidth="3.5" fill="none" />
      {/* G shape */}
      <path
        d="M28 16.5A10 10 0 1 0 30 22H22v-3h10v3a14 14 0 1 1-4-9.8"
        stroke="url(#grip-grad)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
    {/* Wordmark */}
    <span className="grip-logo-text">Grip</span>
  </div>
);

export default GripLogo;
