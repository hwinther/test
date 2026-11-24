import { type JSX, useCallback, useEffect, useId, useRef, useState } from 'react'

import type { LeaderboardEntry } from './leaderboard-api'

import { saveLocalScore, submitSharedScore } from './leaderboard-api'
import './LeaderboardOverlay.css'

type Phase = 'entering-name' | 'showing-scores'

interface LeaderboardOverlayProps {
  readonly onDone: () => void
  readonly score: number
  readonly variant?: 'complete' | 'gameOver'
}

/**
 * Full-screen flow after game over: enter initials, submit score, view top scores.
 * @param {LeaderboardOverlayProps} props - Parent callbacks and final score
 * @returns {JSX.Element} Name entry or high-score table overlay
 */
export function LeaderboardOverlay({ onDone, score, variant = 'gameOver' }: LeaderboardOverlayProps): JSX.Element {
  const [phase, setPhase] = useState<Phase>('entering-name')
  const [name, setName] = useState('')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [showingSharedScores, setShowingSharedScores] = useState(false)
  const [playerRank, setPlayerRank] = useState<number>(-1)
  const [submittedName, setSubmittedName] = useState('')
  const [error, setError] = useState('')
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const doneCalledRef = useRef(false)
  const submittedRef = useRef(false)

  const handleDone = useCallback(() => {
    if (doneCalledRef.current) return
    doneCalledRef.current = true
    onDone()
  }, [onDone])

  useEffect(() => {
    if (phase === 'entering-name') {
      inputRef.current?.focus()
    }
  }, [phase])

  const handleSubmit = useCallback(async () => {
    const trimmed = name.trim()
    if (trimmed.length === 0 || submittedRef.current) return
    submittedRef.current = true

    const local = saveLocalScore(trimmed, score)
    setEntries(local.entries)
    setPlayerRank(local.rank)
    setSubmittedName(trimmed.toUpperCase())
    setPhase('showing-scores')

    try {
      const shared = await submitSharedScore(trimmed, score)
      if (shared && !doneCalledRef.current) {
        setEntries(shared.entries)
        setPlayerRank(shared.rank)
        setShowingSharedScores(true)
      }
    } catch {
      if (!doneCalledRef.current) setError('FELLES POENGLISTE ER UTILGJENGELIG. VISER LOKALE RESULTATER.')
    }
  }, [name, score])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      e.stopPropagation()
      if (e.key === 'Escape') handleDone()
      if (e.key === 'Enter') void handleSubmit()
    },
    [handleDone, handleSubmit],
  )

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === 'Escape' ||
        (phase === 'showing-scores' && !e.repeat && (e.key === 'r' || e.key === 'R' || e.key === 'Enter'))
      ) {
        handleDone()
      }
    }
    globalThis.addEventListener('keydown', handler)
    return () => globalThis.removeEventListener('keydown', handler)
  }, [phase, handleDone])

  if (phase === 'entering-name') {
    return (
      <div className="leaderboard-overlay">
        <div className="leaderboard-name-entry">
          <h2>{variant === 'complete' ? 'ALLE BRETT FULLFØRT!' : 'SPILLET ER OVER'}</h2>
          <p className="leaderboard-final-score">POENG: {score.toLocaleString('nb-NO')}</p>
          <label className="leaderboard-prompt" htmlFor={inputId}>
            SKRIV INN NAVNET DITT
          </label>
          <input
            autoComplete="off"
            className="leaderboard-name-input"
            id={inputId}
            maxLength={8}
            onChange={(e) => setName(e.target.value.replaceAll(/[^a-zA-ZæøåÆØÅ0-9 ]/g, ''))}
            onKeyDown={handleKeyDown}
            placeholder="________"
            ref={inputRef}
            spellCheck={false}
            type="text"
            value={name}
          />
          <p className="leaderboard-submit-hint">TRYKK ENTER FOR Å SENDE INN</p>
        </div>
      </div>
    )
  }

  return (
    <div className="leaderboard-overlay">
      <div className="leaderboard-scores">
        <h2>POENGLISTE</h2>
        <p className="leaderboard-scores-subtitle">{showingSharedScores ? 'Felles poengliste' : 'På denne enheten'}</p>

        <div className="leaderboard-table-header">
          <span className="leaderboard-rank">NR.</span>
          <span className="leaderboard-entry-name">NAVN</span>
          <span className="leaderboard-entry-score">POENG</span>
        </div>

        {entries.length === 0 && <p className="leaderboard-empty">INGEN RESULTATER ENNÅ</p>}

        {entries.slice(0, 10).map((entry, idx) => {
          const isYou = idx === playerRank && entry.name === submittedName
          return (
            <div className={`leaderboard-row${isYou ? ' is-you' : ''}`} key={entry.id ?? `${entry.name}-${entry.ts}`}>
              <span className="leaderboard-rank">{idx + 1}.</span>
              <span className="leaderboard-entry-name">{entry.name}</span>
              <span className="leaderboard-entry-score">{entry.score.toLocaleString('nb-NO')}</span>
            </div>
          )
        })}

        {error && <p className="leaderboard-error">{error}</p>}
        <p className="leaderboard-continue">
          {variant === 'complete' ? 'TRYKK ENTER FOR Å SPILLE IGJEN' : 'TRYKK R FOR Å STARTE PÅ NYTT'}
        </p>
      </div>
    </div>
  )
}
