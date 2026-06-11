/**
 * ProfileManager — create, switch, delete profiles; export/import all profiles as JSON.
 */

import { useRef, useState } from 'react';
import { exportProfiles, importProfiles } from '../lib/profiles';

export default function ProfileManager({
  profiles,
  activeProfile,
  onSwitch,
  onCreate,
  onDelete,
  onProfilesImported,
}) {
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) { setError('Enter a profile name.'); return; }
    if (profiles.includes(name)) { setError('A profile with that name already exists.'); return; }
    setError('');
    onCreate(name);
    setNewName('');
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await importProfiles(file);
      onProfilesImported();
    } catch (err) {
      setError(err.message);
    } finally {
      e.target.value = '';
    }
  };

  return (
    <section className="profile-manager">
      <h2 className="preset-heading">Profiles</h2>

      <div className="profile-tabs">
        {profiles.map((name) => (
          <div
            key={name}
            className={`profile-tab${name === activeProfile ? ' profile-tab--active' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => onSwitch(name)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSwitch(name);
              }
            }}
          >
            {name}
            {name !== 'default' && name !== activeProfile && (
              <button
                type="button"
                className="profile-tab-delete"
                style={{ background: 'none', border: 'none' }}
                title={`Delete profile "${name}"`}
                aria-label={`Delete profile ${name}`}
                onClick={(e) => { e.stopPropagation(); onDelete(name); }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="profile-new">
        <input
          className="preset-input"
          type="text"
          placeholder="New profile name…"
          value={newName}
          maxLength={40}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          aria-label="New profile name"
        />
        <button className="btn btn--secondary" onClick={handleCreate}>Add</button>
      </div>
      {error && <p className="preset-error">{error}</p>}

      <div className="profile-io">
        <button className="btn btn--ghost btn--sm" onClick={exportProfiles} title="Download all profiles as JSON">
          ↓ Export
        </button>
        <button className="btn btn--ghost btn--sm" onClick={() => fileRef.current?.click()} title="Import profiles from JSON">
          ↑ Import
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={handleImport}
          aria-label="Import profiles JSON file"
        />
      </div>
    </section>
  );
}
