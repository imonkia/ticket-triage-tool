import { useState, useRef } from 'react'
import { useDeepgram } from './hooks/useDeepgram'
import { RecordButton } from './components/RecordButton'
import { TranscriptDisplay } from './components/TranscriptDisplay'
import { TriageResult, type TriageData } from './components/TriageResult'

const API_BASE = (import.meta.env.VITE_API_URL as string) ?? ''

function App() {
  const { isRecording, transcript, startRecording, stopRecording, resetTranscript } = useDeepgram()
  const [triageResult, setTriageResult] = useState<TriageData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const transcriptRef = useRef('')

  const handleStart = async () => {
    setError(null)
    setTriageResult(null)
    resetTranscript()
    transcriptRef.current = ''
    try {
      await startRecording()
    } catch {
      setError('Microphone access denied. Please allow microphone access and try again.')
    }
  }

  const handleStop = async () => {
    const finalTranscript = stopRecording()
    transcriptRef.current = finalTranscript

    if (!finalTranscript.trim()) {
      setError('No speech detected. Please try again.')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: finalTranscript }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Server error ${res.status}`)
      }
      const data: TriageData = await res.json()
      setTriageResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to analyze transcript. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    resetTranscript()
    setTriageResult(null)
    setError(null)
  }

  const showTranscript = transcript || transcriptRef.current

  return (
    <div className="app">
      <header className="header">
        <h1 className="header__title">Voice Ticket Triage</h1>
        <p className="header__subtitle">Record a support issue to get instant AI triage</p>
      </header>

      <main className="main">
        <RecordButton
          isRecording={isRecording}
          onStart={handleStart}
          onStop={handleStop}
          disabled={isLoading}
        />

        {showTranscript && (
          <TranscriptDisplay
            transcript={showTranscript}
            isRecording={isRecording}
          />
        )}

        {isLoading && (
          <div className="status-card">
            <span className="spinner" />
            Analyzing transcript with Claude…
          </div>
        )}

        {error && <div className="error-card">{error}</div>}

        {triageResult && <TriageResult result={triageResult} onReset={handleReset} />}
      </main>
    </div>
  )
}

export default App
