import { type JSX, useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from 'react-oidc-context'

import { type ChatMessage, useSignalRChat } from '~/hooks/useSignalRChat'

/**
 * Floating chat widget backed by the Redis pub/sub SSE stream.
 * Renders a minimized bubble in the bottom-right corner; expands into a chat panel on click.
 * Only mounts when the user is authenticated.
 * @returns {JSX.Element} The chat widget.
 */
export function ChatModal(): JSX.Element {
  const auth = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const myName =
    auth.user?.profile.name ??
    (auth.user?.profile.preferred_username as string | undefined) ??
    auth.user?.profile.sub

  const handleMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg])
    setUnread((prev) => prev + 1)
  }, [])

  const sendMessage = useSignalRChat(handleMessage)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  useEffect(() => {
    if (open) setUnread(0)
  }, [open])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const send = (): void => {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    void sendMessage(text)
      .then(() => setInput(''))
      .finally(() => setSending(false))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  if (!open) {
    return (
      <button
        aria-label="Open chat"
        className="fixed bottom-5 right-5 z-50 flex items-center justify-center w-13 h-13 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-colors cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <span className="text-xl">💬</span>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center px-1">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col w-80 h-[28rem] rounded-2xl shadow-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-indigo-600 text-white shrink-0">
        <span className="font-semibold text-sm">Chat</span>
        <button
          aria-label="Minimize chat"
          className="text-indigo-200 hover:text-white transition-colors cursor-pointer text-lg leading-none"
          onClick={() => setOpen(false)}
        >
          −
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 text-sm">
        {messages.length === 0 && (
          <p className="text-center text-neutral-400 text-xs mt-6">No messages yet. Say hi!</p>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.author === myName
          return (
            <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              {!isMe && <span className="text-xs text-neutral-400 mb-0.5 px-1">{msg.author}</span>}
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-1.5 break-words ${
                  isMe
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 px-3 py-2 border-t border-neutral-200 dark:border-neutral-700 shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message…"
          maxLength={500}
          className="flex-1 rounded-full border border-neutral-300 dark:border-neutral-600 px-3 py-1.5 text-sm bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-0"
        />
        <button
          onClick={send}
          disabled={sending || !input.trim()}
          aria-label="Send"
          className="rounded-full w-8 h-8 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition-colors cursor-pointer shrink-0"
        >
          ↑
        </button>
      </div>
    </div>
  )
}
