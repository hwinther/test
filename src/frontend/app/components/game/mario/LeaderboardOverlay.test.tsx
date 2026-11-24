import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { LeaderboardOverlay } from './LeaderboardOverlay'

describe('LeaderboardOverlay', () => {
  afterEach(() => {
    globalThis.localStorage.clear()
    delete globalThis.window.__TEST_PUBLIC__
    vi.unstubAllGlobals()
  })

  it('saves local scores across runs without making a shared request', () => {
    const fetchScore = vi.fn()
    vi.stubGlobal('fetch', fetchScore)
    const onDone = vi.fn()
    const view = render(<LeaderboardOverlay onDone={onDone} score={10_200} />)
    expect(screen.getByText(/^POENG:/)).toHaveTextContent('POENG: 10 200')
    fireEvent.change(screen.getByRole('textbox', { name: 'SKRIV INN NAVNET DITT' }), { target: { value: 'Ægir' } })
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
    expect(screen.getByText('ÆGIR')).toBeInTheDocument()
    expect(screen.getByText('På denne enheten')).toBeInTheDocument()
    fireEvent.keyDown(globalThis.window, { key: 'r' })
    expect(onDone).toHaveBeenCalledOnce()
    view.unmount()

    render(<LeaderboardOverlay onDone={onDone} score={100} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Øyvår' } })
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
    expect(screen.getByText('ÆGIR')).toBeInTheDocument()
    expect(screen.getByText('ØYVÅR')).toBeInTheDocument()
    expect(fetchScore).not.toHaveBeenCalled()
  })

  it('keeps the local board and allows restart when the shared request fails', async () => {
    globalThis.window.__TEST_PUBLIC__ = {
      apiBaseUrl: '',
      otelServiceName: '',
      otelTracesEndpoint: '',
      sharedLeaderboardEnabled: true,
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 503 })))
    const onDone = vi.fn()
    render(<LeaderboardOverlay onDone={onDone} score={100} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Øyvår' } })
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
    expect(screen.getByText('ØYVÅR')).toBeInTheDocument()
    expect(await screen.findByText('FELLES POENGLISTE ER UTILGJENGELIG. VISER LOKALE RESULTATER.')).toBeInTheDocument()
    expect(screen.getByText('På denne enheten')).toBeInTheDocument()
    fireEvent.keyDown(globalThis.window, { key: 'r' })
    expect(onDone).toHaveBeenCalledOnce()
  })

  it('labels the shared board after a successful response', async () => {
    globalThis.window.__TEST_PUBLIC__ = {
      apiBaseUrl: '',
      otelServiceName: '',
      otelTracesEndpoint: '',
      sharedLeaderboardEnabled: true,
    }
    const fetchScore = vi
      .fn()
      .mockResolvedValue(Response.json({ entries: [{ name: 'ØYVÅR', score: 100, ts: 1 }], rank: 0 }))
    vi.stubGlobal('fetch', fetchScore)
    render(<LeaderboardOverlay onDone={vi.fn()} score={100} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Øyvår' } })
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
    expect(await screen.findByText('Felles poengliste')).toBeInTheDocument()
    expect(screen.getByText('ØYVÅR')).toBeInTheDocument()
    expect(fetchScore).toHaveBeenCalledWith(
      '/resources/leaderboard',
      expect.objectContaining({ body: JSON.stringify({ name: 'Øyvår', score: 100 }) }),
    )
  })
})
