import * as signalR from '@microsoft/signalr'
import { useCallback, useEffect, useRef } from 'react'
import { useAuth } from 'react-oidc-context'

import { getApiBaseUrl } from '~/api/mutators/custom-instance'

export interface ChatMessage {
  author: string
  text: string
  timestamp: number
}

/**
 * Connects to the `/hubs/chat` SignalR hub and calls `onMessage` for each broadcast.
 * Returns a stable `sendMessage` function the caller uses to publish messages.
 * Reconnects automatically via SignalR's built-in retry policy; re-creates the
 * connection whenever the access token changes (e.g. after silent renew).
 * @param {(msg: ChatMessage) => void} onMessage - Callback fired for each incoming message.
 * @returns {(text: string) => Promise<void>} Function to send a message through the hub.
 */
export function useSignalRChat(onMessage: (msg: ChatMessage) => void): (text: string) => Promise<void> {
  const auth = useAuth()
  const token = auth.user?.access_token
  const connectionRef = useRef<signalR.HubConnection | null>(null)
  const onMessageRef = useRef(onMessage)

  useEffect(() => {
    onMessageRef.current = onMessage
  })

  useEffect(() => {
    if (!token) return

    const hubUrl = new URL('/hubs/chat', getApiBaseUrl()).toString()
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    connection.on('ReceiveMessage', (msg: ChatMessage) => {
      onMessageRef.current(msg)
    })

    connectionRef.current = connection
    void connection.start().catch((err: unknown) => {
      if (err instanceof Error && err.name === 'AbortError') return
      console.error('[SignalR] connection failed:', err)
    })

    return () => {
      connectionRef.current = null
      void connection.stop()
    }
  }, [token])

  return useCallback(async (text: string): Promise<void> => {
    const conn = connectionRef.current
    if (conn?.state === signalR.HubConnectionState.Connected) {
      await conn.invoke('SendMessage', text)
    }
  }, [])
}
