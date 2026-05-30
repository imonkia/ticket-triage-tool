interface RecordButtonProps {
  isRecording: boolean
  onStart: () => void
  onStop: () => void
  disabled: boolean
}

export function RecordButton({ isRecording, onStart, onStop, disabled }: RecordButtonProps) {
  return (
    <div className="record-wrapper">
      <button
        className={`record-btn${isRecording ? ' record-btn--active' : ''}`}
        onClick={isRecording ? onStop : onStart}
        disabled={disabled}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        <span className="record-btn__icon">
          {isRecording ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v6a2 2 0 1 0 4 0V5a2 2 0 0 0-2-2zm7 8a1 1 0 0 1 1 1 8 8 0 0 1-7 7.938V22h2a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2h2v-2.062A8 8 0 0 1 4 12a1 1 0 1 1 2 0 6 6 0 0 0 12 0 1 1 0 0 1 1-1z" />
            </svg>
          )}
        </span>
        {isRecording && <span className="record-btn__pulse" />}
      </button>
      <p className="record-label">
        {disabled ? 'Analyzing…' : isRecording ? 'Click to stop' : 'Click to record'}
      </p>
    </div>
  )
}
