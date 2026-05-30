export interface TriageData {
  category: string
  severity: string
  suggested_response: string
}

interface TriageResultProps {
  result: TriageData
  onReset: () => void
}

const SEVERITY_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#ef4444',
  critical: '#a855f7',
}

export function TriageResult({ result, onReset }: TriageResultProps) {
  const severityColor = SEVERITY_COLORS[result.severity.toLowerCase()] ?? '#94a3b8'

  return (
    <div className="result-card">
      <h2 className="card-title">Triage Result</h2>

      <div className="result-grid">
        <div className="result-field">
          <span className="field-label">Category</span>
          <span className="field-value field-value--tag">{result.category.replace('_', ' ')}</span>
        </div>

        <div className="result-field">
          <span className="field-label">Severity</span>
          <span
            className="field-value field-value--tag"
            style={{ color: severityColor, borderColor: severityColor }}
          >
            {result.severity}
          </span>
        </div>

        <div className="result-field result-field--full">
          <span className="field-label">Suggested Response</span>
          <p className="field-value field-value--response">{result.suggested_response}</p>
        </div>
      </div>

      <button className="reset-btn" onClick={onReset}>
        New Ticket
      </button>
    </div>
  )
}
