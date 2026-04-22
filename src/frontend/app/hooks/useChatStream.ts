import { useEffect, useRef } from 'react'
import { useAuth } from 'react-oidc-context'

import { getApiBaseUrl } from '~/api/mutators/custom-instance'

export interface ChatMessage {
  author: string
  text: string
  timestamp: number
}

/**
 * Connects to the backend SSE chat stream and calls `onMessage` for each received event.
 * Uses fetch (not EventSource) so the Authorization header can be sent.
 * Reconnects automatically when the token changes or the connection drops.
 * @param {(msg: ChatMessage) => void} onMessage - Callback fired for each incoming message.
 */
export function useChatStream(onMessage: (msg: ChatMessage) => void): void {
  const auth = useAuth()
  const token = auth.user?.access_token
  const onMessageRef = useRef(onMessage)

  useEffect(() => {
    onMessageRef.current = onMessage
  })

  useEffect(() => {
    if (!token) return

    const url = `${getApiBaseUrl()}api/v1/Chat/stream`
    const controller = new AbortController()
    let cancelled = false

    const connect = async (): Promise<void> => {
      try {
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        })

        if (!response.ok || !response.body) return

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        for (;;) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })

          // SSE events are delimited by double newlines
          const parts = buffer.split('\n\n')
          buffer = parts.pop() ?? ''

          for (const part of parts) {
            const dataLine = part.split('\n').find((l) => l.startsWith('data: '))
            if (dataLine) {
              try {
                onMessageRef.current(JSON.parse(dataLine.slice(6)) as ChatMessage)
              } catch {
                // ignore malformed events
              }
            }
          }
        }
      } catch {
        // AbortError means we cleaned up intentionally; anything else → reconnect
        if (!cancelled) {
          setTimeout(() => { void connect() }, 3000)
        }
      }
    }

    void connect()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [token])
}
