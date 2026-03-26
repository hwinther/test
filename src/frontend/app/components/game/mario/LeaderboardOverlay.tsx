import { type JSX, useCallback, useEffect, useRef, useState } from 'react'

import type { LeaderboardEntry } from './leaderboard-api'

import { fetchLeaderboard, submitScore } from './leaderboard-api'
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
  const [playerRank, setPlayerRank] = useState<number>(-1)
  const [submittedName, setSubmittedName] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const doneCalledRef = useRef(false)

  useEffect(() => {
    if (phase === 'entering-name') {
      inputRef.current?.focus()
    }
  }, [phase])

  const handleSubmit = useCallback(async () => {
    const trimmed = name.trim()
    if (trimmed.length === 0) return

    try {
      const rank = await submitScore(trimmed, score)
      setPlayerRank(rank)
      setSubmittedName(trimmed.toUpperCase())

      const board = await fetchLeaderboard()
      setEntries(board)
      setPhase('showing-scores')
    } catch {
      setError('COULD NOT REACH LEADERBOARD')
      setPhase('showing-scores')
      try {
        const board = await fetchLeaderboard()
        setEntries(board)
      } catch {
        /* offline - show empty */
      }
    }
  }, [name, score])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      e.stopPropagation()
      if (e.key === 'Enter') {
        void handleSubmit()
      }
    },
    [handleSubmit],
  )

  useEffect(() => {
    if (phase !== 'showing-scores') return

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R' || e.key === 'Escape' || e.key === 'Enter') {
        if (!doneCalledRef.current) {
          doneCalledRef.current = true
          onDone()
        }
      }
    }
    globalThis.addEventListener('keydown', handler)
    return () => globalThis.removeEventListener('keydown', handler)
  }, [phase, onDone])

  if (phase === 'entering-name') {
    return (
      <div className="leaderboard-overlay">
        <div className="leaderboard-name-entry">
          <h2>{variant === 'complete' ? 'ALL LEVELS COMPLETE!' : 'GAME OVER'}</h2>
          <p className="leaderboard-final-score">SCORE: {score.toLocaleString()}</p>
          <p className="leaderboard-prompt">ENTER YOUR NAME</p>
          <input
            autoComplete="off"
            className="leaderboard-name-input"
            maxLength={8}
            onChange={(e) => setName(e.target.value.replaceAll(/[^a-zA-Z0-9 ]/g, ''))}
            onKeyDown={handleKeyDown}
            placeholder="________"
            ref={inputRef}
            spellCheck={false}
            type="text"
            value={name}
          />
          <p className="leaderboard-submit-hint">PRESS ENTER TO SUBMIT</p>
          {error && <p className="leaderboard-error">{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="leaderboard-overlay">
      <div className="leaderboard-scores">
        <h2>HIGH SCORES</h2>
        <p className="leaderboard-scores-subtitle">TOP {Math.min(entries.length, 10)} PLAYERS</p>

        <div className="leaderboard-table-header">
          <span className="leaderboard-rank">RNK</span>
          <span className="leaderboard-entry-name">NAME</span>
          <span className="leaderboard-entry-score">SCORE</span>
        </div>

        {entries.length === 0 && <p className="leaderboard-empty">NO SCORES YET</p>}

        {entries.slice(0, 10).map((entry, idx) => {
          const isYou = idx === playerRank && entry.name === submittedName
          return (
            <div className={`leaderboard-row${isYou ? ' is-you' : ''}`} key={`${entry.name}-${entry.ts}`}>
              <span className="leaderboard-rank">{idx + 1}.</span>
              <span className="leaderboard-entry-name">{entry.name}</span>
              <span className="leaderboard-entry-score">{entry.score.toLocaleString()}</span>
            </div>
          )
        })}

        {error && <p className="leaderboard-error">{error}</p>}
        <p className="leaderboard-continue">{variant === 'complete' ? 'PRESS ENTER TO PLAY AGAIN' : 'PRESS R TO RESTART'}</p>
      </div>
    </div>
  )
}
