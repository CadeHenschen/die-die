/** Core dice rolling logic — mirrors die_roller/dice.py */

export const VALID_SIDES = [4, 6, 8, 10, 12, 20, 100];

/**
 * Roll a single die.
 * @param {number} sides
 * @returns {number}
 */
export function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Roll a set of dice groups.
 * @param {Array<{count: number, sides: number}>} entries
 * @returns {{ rolls: Array<{notation: string, results: number[], subtotal: number}>, total: number }}
 */
export function rollDiceSet(entries) {
  const rolls = [];
  let total = 0;
  for (const { count, sides } of entries) {
    const results = Array.from({ length: count }, () => rollDie(sides));
    const subtotal = results.reduce((a, b) => a + b, 0);
    rolls.push({ notation: `${count}d${sides}`, results, subtotal });
    total += subtotal;
  }
  return { rolls, total };
}

/**
 * Format a dice set as a human-readable string (e.g. "1d20 + 2d6").
 * @param {Array<{count: number, sides: number}>} entries
 * @returns {string}
 */
export function formatDiceSet(entries) {
  if (!entries || entries.length === 0) return '(empty)';
  return entries.map(({ count, sides }) => `${count}d${sides}`).join(' + ');
}
