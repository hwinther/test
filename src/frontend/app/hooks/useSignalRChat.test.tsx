// cspell:ignore signalr
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeAuth, type FakeAuth, signedIn } from '~test/auth'

import { type ChatMessage, useSignalRChat } from './useSignalRChat'

/** One built hub connection, recording what the hook does with it. */
class FakeConnection {
  state = 'Connected'
  handlers = new Map<string, (msg: ChatMessage) => void>()
  invoked: unknown[][] = []
  stopped = false
  constructor(
    readonly url: string,
    readonly token: string,
    readonly startResult: Promise<void>,
  ) {}
  on(name: string, handler: (msg: ChatMessage) => void) {
    this.handlers.set(name, handler)
  }
  start() {
    return this.startResult
  }
  stop() {
    this.stopped = true
    return Promise.resolve()
  }
  invoke(...args: unknown[]) {
    this.invoked.push(args)
    return Promise.resolve()
  }
}

const hub: { connections: FakeConnection[]; nextStart: () => Promise<void> } = {
  connections: [],
  nextStart: () => Promise.resolve(),
}

vi.mock('@microsoft/signalr', () => ({
  LogLevel: { Error: 4 },
  HubConnectionState: { Connected: 'Connected' },
  HubConnectionBuilder: class {
    private url = ''
    private token = ''
    withUrl(url: string, options: { accessTokenFactory: () => string }) {
      this.url = url
      this.token = options.accessTokenFactory()
      return this
    }
    withAutomaticReconnect() {
      return this
    }
    configureLogging() {
      return this
    }
    build() {
      const connection = new FakeConnection(this.url, this.token, hub.nextStart())
      hub.connections.push(connection)
      return connection
    }
  },
}))

const state: { auth: FakeAuth } = { auth: fakeAuth() }
vi.mock('react-oidc-context', () => ({ useAuth: () => state.auth }))

describe('useSignalRChat', () => {
  beforeEach(() => {
    hub.connections = []
    hub.nextStart = () => Promise.resolve()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('does not connect without a token, and sends nothing', async () => {
    state.auth = fakeAuth()
    const { result } = renderHook(() => useSignalRChat(() => undefined))

    await result.current('hello')
    expect(hub.connections).toHaveLength(0)
  })

  it('connects to the chat hub with the token, delivers messages and sends', async () => {
    state.auth = signedIn({ sub: 'u' }, 'tok-a')
    const received: ChatMessage[] = []
    const { result } = renderHook(() => useSignalRChat((m) => received.push(m)))

    const [connection] = hub.connections
    expect(connection!.url).toBe('https://localhost:7156/hubs/chat')
    expect(connection!.token).toBe('tok-a')

    act(() => connection!.handlers.get('ReceiveMessage')!({ author: 'a', text: 'hi', timestamp: 1 }))
    expect(received).toEqual([{ author: 'a', text: 'hi', timestamp: 1 }])

    await result.current('hello')
    expect(connection!.invoked).toEqual([['SendMessage', 'hello']])
  })

  it('does not send while disconnected', async () => {
    state.auth = signedIn({ sub: 'u' })
    const { result } = renderHook(() => useSignalRChat(() => undefined))
    hub.connections[0]!.state = 'Reconnecting'

    await result.current('hello')
    expect(hub.connections[0]!.invoked).toEqual([])
  })

  it('reconnects when the token changes, and stops on unmount', () => {
    state.auth = signedIn({ sub: 'u' }, 'tok-a')
    const { rerender, unmount } = renderHook(() => useSignalRChat(() => undefined))

    state.auth = signedIn({ sub: 'u' }, 'tok-b')
    rerender()
    expect(hub.connections.map((c) => [c.token, c.stopped])).toEqual([
      ['tok-a', true],
      ['tok-b', false],
    ])

    unmount()
    expect(hub.connections[1]!.stopped).toBe(true)
  })

  it('logs a failed start, but not an aborted one', async () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    state.auth = signedIn({ sub: 'u' }, 'tok-a')
    const aborted = Object.assign(new Error('stopped'), { name: 'AbortError' })
    hub.nextStart = () => Promise.reject(aborted)
    const view = renderHook(() => useSignalRChat(() => undefined))
    await act(async () => {
      await Promise.resolve()
    })
    expect(errors).not.toHaveBeenCalled()
    view.unmount()

    hub.nextStart = () => Promise.reject(new Error('refused'))
    renderHook(() => useSignalRChat(() => undefined))
    await act(async () => {
      await Promise.resolve()
    })
    expect(errors).toHaveBeenCalledWith('[SignalR] connection failed:', expect.any(Error))
  })
})
