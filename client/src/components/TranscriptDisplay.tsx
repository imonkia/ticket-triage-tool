interface TranscriptDisplayProps {
  transcript: string
  isRecording: boolean
}

export function TranscriptDisplay({ transcript, isRecording }: TranscriptDisplayProps) {
  return (
    <div className="transcript-card">
      <h2 className="card-title">Live Transcript</h2>
      <p className="transcript-text">
        {transcript}
        {isRecording && <span className="cursor" aria-hidden="true" />}
      </p>
    </div>
  )
}
