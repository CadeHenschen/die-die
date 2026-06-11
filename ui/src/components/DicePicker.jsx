/** DicePicker — row of die buttons, each with a count stepper. */

import { VALID_SIDES } from '../lib/dice';

/** SVG polygon shapes for each die face */
const DIE_ICONS = {
  4: (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <polygon points="20,4 36,34 4,34" />
      <text x="20" y="28" textAnchor="middle" fontSize="11" fill="currentColor" fontWeight="bold">4</text>
    </svg>
  ),
  6: (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <rect x="5" y="5" width="30" height="30" rx="4" />
      <text x="20" y="26" textAnchor="middle" fontSize="11" fill="currentColor" fontWeight="bold">6</text>
    </svg>
  ),
  8: (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <polygon points="20,3 37,20 20,37 3,20" />
      <text x="20" y="25" textAnchor="middle" fontSize="11" fill="currentColor" fontWeight="bold">8</text>
    </svg>
  ),
  10: (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <polygon points="20,3 38,14 33,34 7,34 2,14" />
      <text x="20" y="25" textAnchor="middle" fontSize="10" fill="currentColor" fontWeight="bold">10</text>
    </svg>
  ),
  12: (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <polygon points="20,2 35,10 38,27 25,38 15,38 2,27 5,10" />
      <text x="20" y="26" textAnchor="middle" fontSize="10" fill="currentColor" fontWeight="bold">12</text>
    </svg>
  ),
  20: (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <polygon points="20,2 38,14 32,36 8,36 2,14" />
      <text x="20" y="26" textAnchor="middle" fontSize="10" fill="currentColor" fontWeight="bold">20</text>
    </svg>
  ),
  100: (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="17" />
      <text x="20" y="25" textAnchor="middle" fontSize="9" fill="currentColor" fontWeight="bold">100</text>
    </svg>
  ),
};

/**
 * @param {{
 *   counts: Record<number, number>,
 *   onChange: (sides: number, delta: number) => void
 * }} props
 */
export default function DicePicker({ counts, onChange }) {
  return (
    <div className="dice-picker">
      {VALID_SIDES.map((sides) => {
        const count = counts[sides] ?? 0;
        return (
          <div key={sides} className={`die-card ${count > 0 ? 'die-card--active' : ''}`}>
            <button
              className="die-icon"
              onClick={() => onChange(sides, 1)}
              title={`Add d${sides}`}
              aria-label={`Add d${sides}`}
            >
              {DIE_ICONS[sides]}
            </button>
            <span className="die-label">d{sides}</span>
            <div className="die-stepper">
              <button
                className="stepper-btn"
                onClick={() => onChange(sides, -1)}
                disabled={count === 0}
                aria-label={`Remove one d${sides}`}
              >
                −
              </button>
              <span className="stepper-count">{count}</span>
              <button
                className="stepper-btn"
                onClick={() => onChange(sides, 1)}
                aria-label={`Add one d${sides}`}
              >
                +
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
