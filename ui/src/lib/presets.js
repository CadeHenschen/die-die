/** Preset persistence using localStorage. */

const STORAGE_KEY = 'die_die_presets';

/**
 * Load all presets from localStorage.
 * @returns {Record<string, Array<{count: number, sides: number}>>}
 */
export function loadPresets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Save a preset to localStorage.
 * @param {string} name
 * @param {Array<{count: number, sides: number}>} entries
 */
export function savePreset(name, entries) {
  const presets = loadPresets();
  presets[name] = entries;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

/**
 * Delete a preset from localStorage.
 * @param {string} name
 */
export function deletePreset(name) {
  const presets = loadPresets();
  delete presets[name];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}
