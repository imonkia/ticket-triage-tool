import { useState, useRef, useCallback } from 'react'
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk'

export interface UseDeepgramReturn {
  isRecording: boolean
  transcript: string
  startRecording: () => Promise<void>
  stopRecording: () => string
  resetTranscript: () => void
}

export function useDeepgram(): UseDeepgramReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')

  // Refs hold the live values used inside event handlers
  const connectionRef = useRef<ReturnType<ReturnType<typeof createClient>['listen']['live']> | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const finalTextRef = useRef('')
  const interimTextRef = useRef('')

  const buildTranscript = () =>
    [finalTextRef.current, interimTextRef.current].filter(Boolean).join(' ')

  const startRecording = useCallback(async () => {
    const apiKey = import.meta.env.VITE_DEEPGRAM_API_KEY as string
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream

    const deepgram = createClient(apiKey)
    const connection = deepgram.listen.live({
      model: 'nova-2',
      language: 'en-US',
      smart_format: true,
      interim_results: true,
    })
    connectionRef.current = connection

    connection.on(LiveTranscriptionEvents.Open, () => {
      const recorder = new MediaRecorder(stream)
      recorder.addEventListener('dataavailable', (e) => {
        if (e.data.size > 0 && connectionRef.current) {
          connectionRef.current.send(e.data)
        }
      })
      recorder.start(250)
      mediaRecorderRef.current = recorder
      setIsRecording(true)
    })

    connection.on(LiveTranscriptionEvents.Transcript, (data) => {
      const text: string = data.channel?.alternatives?.[0]?.transcript ?? ''
      if (!text) return

      if (data.is_final) {
        finalTextRef.current = buildTranscript().replace(interimTextRef.current, '').trim()
        finalTextRef.current = (finalTextRef.current ? finalTextRef.current + ' ' : '') + text
        interimTextRef.current = ''
      } else {
        interimTextRef.current = text
      }
      setTranscript(buildTranscript())
    })

    connection.on(LiveTranscriptionEvents.Error, (err) => {
      console.error('Deepgram error:', err)
    })
  }, [])

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop()
    connectionRef.current?.finish()
    streamRef.current?.getTracks().forEach((t) => t.stop())

    connectionRef.current = null
    mediaRecorderRef.current = null
    streamRef.current = null
    setIsRecording(false)

    // Return the current accumulated transcript so callers get the final value synchronously
    const final = buildTranscript()
    return final
  }, [])

  const resetTranscript = useCallback(() => {
    finalTextRef.current = ''
    interimTextRef.current = ''
    setTranscript('')
  }, [])

  return { isRecording, transcript, startRecording, stopRecording, resetTranscript }
}
