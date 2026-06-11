import { useState, useCallback } from 'react';
import DicePicker from './components/DicePicker';
import RollResult from './components/RollResult';
import PresetPanel from './components/PresetPanel';
import ProfileManager from './components/ProfileManager';
import { VALID_SIDES, rollDiceSet, formatDiceSet } from './lib/dice';
import {
  loadPresets, savePreset, deletePreset,
  getActiveProfile, listProfiles, createProfile, switchProfile, deleteProfile,
} from './lib/profiles';
import './App.css';

const EMPTY_COUNTS = Object.fromEntries(VALID_SIDES.map((s) => [s, 0]));

function countsToEntries(counts) {
  return VALID_SIDES.filter((s) => counts[s] > 0).map((s) => ({ count: counts[s], sides: s }));
}

function entriesToCounts(entries) {
  const counts = { ...EMPTY_COUNTS };
  for (const { count, sides } of entries) counts[sides] = count;
  return counts;
}

function loadProfileState() {
  return {
    activeProfile: getActiveProfile(),
    profiles: listProfiles(),
    presets: loadPresets(),
  };
}

export default function App() {
  const [profileState, setProfileState] = useState(loadProfileState);
  const [counts, setCounts] = useState(EMPTY_COUNTS);
  const [rollResult, setRollResult] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [activePreset, setActivePreset] = useState(null);

  const refresh = () => setProfileState(loadProfileState());

  const handleDiceChange = useCallback((sides, delta) => {
    setCounts((prev) => ({ ...prev, [sides]: Math.max(0, (prev[sides] ?? 0) + delta) }));
    setActivePreset(null);
  }, []);

  const handleClear = () => { setCounts(EMPTY_COUNTS); setRollResult(null); setActivePreset(null); };

  const handleRoll = (entries) => {
    if (!entries || entries.length === 0) return;
    setRolling(true);
    setRollResult(null);
    setTimeout(() => { setRollResult(rollDiceSet(entries)); setRolling(false); }, 350);
  };

  const handleRollCurrent = () => handleRoll(countsToEntries(counts));

  // ── Preset handlers ─────────────────────────────────────────────────────────
  const handleSavePreset = (name) => { savePreset(name, countsToEntries(counts)); refresh(); setActivePreset(name); };
  const handleLoadPreset = (name) => { setCounts(entriesToCounts(profileState.presets[name])); setRollResult(null); setActivePreset(name); };
  const handleDeletePreset = (name) => { deletePreset(name); refresh(); if (activePreset === name) setActivePreset(null); };
  const handleRollPreset = (name) => {
    const entries = profileState.presets[name];
    setCounts(entriesToCounts(entries));
    setActivePreset(name);
    handleRoll(entries);
  };

  // ── Profile handlers ─────────────────────────────────────────────────────────
  const handleSwitchProfile = (name) => { switchProfile(name); refresh(); setCounts(EMPTY_COUNTS); setRollResult(null); setActivePreset(null); };
  const handleCreateProfile = (name) => { createProfile(name); switchProfile(name); refresh(); setCounts(EMPTY_COUNTS); setRollResult(null); setActivePreset(null); };
  const handleDeleteProfile = (name) => { deleteProfile(name); refresh(); };

  const currentEntries = countsToEntries(counts);
  const hasSelection = currentEntries.length > 0;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-emblem" aria-hidden="true">⚔️</div>
        <h1 className="app-title">Die Die</h1>
        <p className="app-subtitle">Dungeons &amp; Dragons Dice Roller</p>
      </header>

      <main className="app-main">
        <ProfileManager
          profiles={profileState.profiles}
          activeProfile={profileState.activeProfile}
          onSwitch={handleSwitchProfile}
          onCreate={handleCreateProfile}
          onDelete={handleDeleteProfile}
          onProfilesImported={refresh}
        />

        <section className="picker-section">
          <div className="section-header">
            <h2 className="section-title">
              {activePreset ? (<>Rolling: <em>{activePreset}</em></>) : 'Build Your Roll'}
            </h2>
            {hasSelection && <span className="current-notation">{formatDiceSet(currentEntries)}</span>}
          </div>

          <DicePicker counts={counts} onChange={handleDiceChange} />

          <div className="roll-actions">
            <button className="btn btn--roll btn--lg" onClick={handleRollCurrent} disabled={!hasSelection || rolling}>
              {rolling ? '…' : 'Roll!'}
            </button>
            {hasSelection && (
              <button className="btn btn--ghost" onClick={handleClear}>Clear</button>
            )}
          </div>
        </section>

        <RollResult result={rollResult} rolling={rolling} />

        <PresetPanel
          presets={profileState.presets}
          currentEntries={currentEntries}
          onSave={handleSavePreset}
          onLoad={handleLoadPreset}
          onDelete={handleDeletePreset}
          onRollPreset={handleRollPreset}
        />
      </main>

      <footer className="app-footer">
        <p>Roll with advantage ✨</p>
      </footer>
    </div>
  );
}
