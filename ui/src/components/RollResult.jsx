/** RollResult — animated display of the most recent roll. */

/**
 * @param {{
 *   result: {
 *     rolls: Array<{notation: string, results: number[], subtotal: number}>,
 *     total: number
 *   } | null,
 *   rolling: boolean
 * }} props
 */
export default function RollResult({ result, rolling }) {
  if (rolling) {
    return (
      <div className="roll-result roll-result--rolling">
        <span className="rolling-text">Rolling…</span>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="roll-result roll-result--empty">
        <p className="empty-hint">Select dice above and press <strong>Roll!</strong></p>
      </div>
    );
  }

  return (
    <div className="roll-result roll-result--show">
      <div className="result-rows">
        {result.rolls.map((row, i) => (
          <div key={i} className="result-row">
            <span className="result-notation">{row.notation}</span>
            <span className="result-arrow">→</span>
            <span className="result-dice">
              {row.results.map((r, j) => (
                <span key={j} className="result-pip">{r}</span>
              ))}
            </span>
            <span className="result-subtotal">= {row.subtotal}</span>
          </div>
        ))}
      </div>
      {result.rolls.length > 1 && (
        <div className="result-total">
          Total: <strong>{result.total}</strong>
        </div>
      )}
      {result.rolls.length === 1 && (
        <div className="result-total">
          Total: <strong>{result.total}</strong>
        </div>
      )}
    </div>
  );
}
