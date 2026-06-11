/**
 * Multi-profile persistence using localStorage.
 *
 * Data shape stored under PROFILES_KEY:
 * {
 *   activeProfile: "default",
 *   profiles: {
 *     "default": {
 *       presets: {
 *         "fireball": [{ count: 8, sides: 6 }],
 *         ...
 *       }
 *     },
 *     "Aragorn": { presets: { ... } },
 *     ...
 *   }
 * }
 */

const PROFILES_KEY = 'die_die_profiles';
const DEFAULT_PROFILE = 'default';

/** @returns {{ activeProfile: string, profiles: Record<string, { presets: Record<string, Array<{count:number,sides:number}>> }> }} */
function normalizeStore(store) {
  const profiles =
    store && typeof store === 'object' && store.profiles && typeof store.profiles === 'object'
      ? store.profiles
      : {};

  if (!profiles[DEFAULT_PROFILE]) profiles[DEFAULT_PROFILE] = { presets: {} };

  const activeProfile =
    typeof store?.activeProfile === 'string' && store.activeProfile in profiles
      ? store.activeProfile
      : DEFAULT_PROFILE;

  return { activeProfile, profiles };
}

function loadStore() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (raw) return normalizeStore(JSON.parse(raw));
  } catch {
    // fall through to default
  }
  return normalizeStore({});
}

function saveStore(store) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(store));
}

// ── Profile management ───────────────────────────────────────────────────────

export function getActiveProfile() {
  return loadStore().activeProfile;
}

export function listProfiles() {
  return Object.keys(loadStore().profiles);
}

export function createProfile(name) {
  const store = loadStore();
  if (!store.profiles[name]) {
    store.profiles[name] = { presets: {} };
    saveStore(store);
  }
}

export function switchProfile(name) {
  const store = loadStore();
  if (!store.profiles[name]) store.profiles[name] = { presets: {} };
  store.activeProfile = name;
  saveStore(store);
}

export function deleteProfile(name) {
  const store = loadStore();
  if (name === DEFAULT_PROFILE) throw new Error("Cannot delete the default profile.");
  delete store.profiles[name];
  if (store.activeProfile === name) store.activeProfile = DEFAULT_PROFILE;
  saveStore(store);
}

// ── Preset management (scoped to active profile) ────────────────────────────

export function loadPresets() {
  const store = loadStore();
  const profile = store.profiles[store.activeProfile];
  return profile ? { ...profile.presets } : {};
}

export function savePreset(name, entries) {
  const store = loadStore();
  if (!store.profiles[store.activeProfile]) {
    store.profiles[store.activeProfile] = { presets: {} };
  }
  store.profiles[store.activeProfile].presets[name] = entries;
  saveStore(store);
}

export function deletePreset(name) {
  const store = loadStore();
  const profile = store.profiles[store.activeProfile];
  if (profile) delete profile.presets[name];
  saveStore(store);
}

// ── Export / Import ──────────────────────────────────────────────────────────

/** Download all profiles as a JSON file. */
export function exportProfiles() {
  const store = loadStore();
  const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'die-die-profiles.json';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import profiles from a JSON file, merging into existing data.
 * If any incoming profile name already exists locally the user is asked to
 * confirm the overwrite; cancelling leaves all existing data untouched.
 * @param {File} file
 * @returns {Promise<void>}
 */
export function importProfiles(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const incoming = JSON.parse(e.target.result);
        if (!incoming || typeof incoming !== 'object' || !incoming.profiles) {
          reject(new Error('Invalid profile file format.'));
          return;
        }
        const store = loadStore();
        const conflicts = Object.keys(incoming.profiles).filter(
          (name) => name in store.profiles,
        );
        if (conflicts.length > 0) {
          const list = conflicts.map((n) => `"${n}"`).join(', ');
          const ok = window.confirm(
            `The following profile(s) already exist and will be overwritten:\n\n${list}\n\nContinue?`,
          );
          if (!ok) {
            resolve();
            return;
          }
        }
        for (const [name, data] of Object.entries(incoming.profiles)) {
          store.profiles[name] = data;
        }
        saveStore(store);
        resolve();
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}
