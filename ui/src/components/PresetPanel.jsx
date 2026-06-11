/** PresetPanel — save, list, roll, and delete named dice presets. */

import { useState } from 'react';
import { formatDiceSet } from '../lib/dice';

/**
 * @param {{
 *   presets: Record<string, Array<{count: number, sides: number}>>,
 *   currentEntries: Array<{count: number, sides: number}>,
 *   onSave: (name: string) => void,
 *   onLoad: (name: string) => void,
 *   onDelete: (name: string) => void,
 *   onRollPreset: (name: string) => void,
 * }} props
 */
export default function PresetPanel({
  presets,
  currentEntries,
  onSave,
  onLoad,
  onDelete,
  onRollPreset,
}) {
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    const name = newName.trim();
    if (!name) {
      setError('Please enter a preset name.');
      return;
    }
    if (currentEntries.length === 0) {
      setError('Select at least one die before saving.');
      return;
    }
    setError('');
    onSave(name);
    setNewName('');
  };

  const presetNames = Object.keys(presets).sort();

  return (
    <section className="preset-panel">
      <h2 className="preset-heading">Presets</h2>

      <div className="preset-save">
        <input
          className="preset-input"
          type="text"
          placeholder="Preset name…"
          value={newName}
          maxLength={40}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          aria-label="New preset name"
        />
        <button className="btn btn--secondary" onClick={handleSave}>
          Save current
        </button>
      </div>
      {error && <p className="preset-error">{error}</p>}

      {presetNames.length === 0 ? (
        <p className="preset-empty">No presets yet — build a dice set and save it!</p>
      ) : (
        <ul className="preset-list">
          {presetNames.map((name) => (
            <li key={name} className="preset-item">
              <div className="preset-info">
                <span className="preset-name">{name}</span>
                <span className="preset-notation">{formatDiceSet(presets[name])}</span>
              </div>
              <div className="preset-actions">
                <button
                  className="btn btn--icon"
                  title="Load into picker"
                  onClick={() => onLoad(name)}
                  aria-label={`Load preset ${name}`}
                >
                  ✎
                </button>
                <button
                  className="btn btn--roll btn--sm"
                  onClick={() => onRollPreset(name)}
                  aria-label={`Roll preset ${name}`}
                >
                  Roll
                </button>
                <button
                  className="btn btn--danger btn--sm"
                  onClick={() => onDelete(name)}
                  aria-label={`Delete preset ${name}`}
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
