import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type FakeAuth, signedIn } from '~test/auth'

import type { ChatMessage } from '~/hooks/useSignalRChat'

import { ChatModal } from './ChatModal'

const chat: {
  onMessage: (msg: ChatMessage) => void
  sent: string[]
  send: (text: string) => Promise<void>
} = {
  onMessage: () => undefined,
  sent: [],
  send: () => Promise.resolve(),
}

vi.mock('~/hooks/useSignalRChat', () => ({
  useSignalRChat: (onMessage: (msg: ChatMessage) => void) => {
    chat.onMessage = onMessage
    return (text: string) => {
      chat.sent.push(text)
      return chat.send(text)
    }
  },
}))

const state: { auth: FakeAuth } = { auth: signedIn({ name: 'Me', sub: 'me' }) }
vi.mock('react-oidc-context', () => ({ useAuth: () => state.auth }))

const receive = (author: string, text: string, timestamp: number) =>
  act(() => chat.onMessage({ author, text, timestamp }))

describe('ChatModal', () => {
  beforeEach(() => {
    chat.sent = []
    chat.send = () => Promise.resolve()
    state.auth = signedIn({ name: 'Me', sub: 'me' })
  })

  it('counts unread messages while minimized, and clears the count when opened', () => {
    render(<ChatModal />)
    receive('Ann', 'hi', 1)
    receive('Ann', 'there', 2)

    expect(screen.getByRole('button', { name: 'Open chat' })).toHaveTextContent('2')
    fireEvent.click(screen.getByRole('button', { name: 'Open chat' }))
    expect(screen.getByText('hi')).toBeInTheDocument()
    expect(screen.getAllByText('Ann')).toHaveLength(2)

    fireEvent.click(screen.getByRole('button', { name: 'Minimize chat' }))
    expect(screen.getByRole('button', { name: 'Open chat' })).not.toHaveTextContent(/\d/)
  })

  it('shows 99+ for many unread messages', () => {
    render(<ChatModal />)
    for (let i = 0; i < 100; i++) receive('Ann', `m${i}`, i)
    expect(screen.getByRole('button', { name: 'Open chat' })).toHaveTextContent('99+')
  })

  it('shows an empty state, and own messages without the author', () => {
    render(<ChatModal />)
    fireEvent.click(screen.getByRole('button', { name: 'Open chat' }))
    expect(screen.getByText('No messages yet. Say hi!')).toBeInTheDocument()

    receive('Me', 'mine', 1)
    expect(screen.getByText('mine')).toBeInTheDocument()
    expect(screen.queryByText('Me')).not.toBeInTheDocument()
  })

  it('falls back to the username, then the subject, as its own name', () => {
    state.auth = signedIn({ preferred_username: 'hcw', sub: 'me' })
    render(<ChatModal />)
    fireEvent.click(screen.getByRole('button', { name: 'Open chat' }))
    receive('hcw', 'mine', 1)
    expect(screen.queryByText('hcw')).not.toBeInTheDocument()
  })

  it('sends with the button and with Enter, trimmed, and clears the field', async () => {
    render(<ChatModal />)
    fireEvent.click(screen.getByRole('button', { name: 'Open chat' }))
    const input = screen.getByPlaceholderText('Message…')
    const send = screen.getByRole('button', { name: 'Send' })

    expect(input).toHaveFocus()
    expect(send).toBeDisabled()
    fireEvent.change(input, { target: { value: '  hello  ' } })
    fireEvent.click(send)
    expect(chat.sent).toEqual(['hello'])
    await waitFor(() => expect(input).toHaveValue(''))

    fireEvent.change(input, { target: { value: 'again' } })
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })
    expect(chat.sent).toEqual(['hello'])
    fireEvent.keyDown(input, { key: 'a' })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(chat.sent).toEqual(['hello', 'again'])
    await waitFor(() => expect(input).toHaveValue(''))
  })

  it('sends nothing blank, and one message at a time', async () => {
    let finish: () => void = () => undefined
    chat.send = () =>
      new Promise<void>((resolve) => {
        finish = resolve
      })
    render(<ChatModal />)
    fireEvent.click(screen.getByRole('button', { name: 'Open chat' }))
    const input = screen.getByPlaceholderText('Message…')

    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(chat.sent).toEqual([])

    fireEvent.change(input, { target: { value: 'slow' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(chat.sent).toEqual(['slow'])
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()

    await act(async () => {
      finish()
      await Promise.resolve()
    })
    expect(input).toHaveValue('')
  })
})
