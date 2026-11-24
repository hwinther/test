import { type JSX, useCallback, useEffect, useRef, useState } from 'react'

import type { LevelData } from './level-format'
import type { GameInputSnapshot, KeyState, MarioGameResult, MarioGameState, SpriteTheme } from './mario-types'

import { startBotvarProofroom } from './botvar-proofroom'
import { BOTVAR_STAGE_TITLES, getBotvarMilestone } from './botvar-workflow'
import { LeaderboardOverlay } from './LeaderboardOverlay'
import { LevelLoader } from './level-loader'
import { MapEditor } from './MapEditor'
import { buildMarioGameResult, drawGame } from './mario-game-canvas'
import {
  advanceGameState,
  createInitialGameState,
  FIXED_DT,
  MARIO_CANVAS_HEIGHT,
  MARIO_CANVAS_WIDTH,
} from './mario-game-logic'
import { buildGameInputSnapshot } from './mario-input-helpers'
import { clearMarioKeyboardInput, handleMarioKeyDown, handleMarioKeyUp } from './mario-keyboard'
import './MarioGame.css'

/** Props for the Mario canvas game shell (play, editor, level chain, callbacks). */
export interface MarioGameProps {
  readonly documentCampaign?: boolean
  readonly customLevel?: LevelData
  readonly levelSequence?: LevelData[]
  readonly onClose?: () => void
  readonly onLevelComplete?: (result: MarioGameResult) => void
  readonly showEditor?: boolean
  readonly spriteTheme?: SpriteTheme
}

/**
 * Mario-style side-scrolling platform game (fixed-step sim, canvas render, optional editor).
 * @param {MarioGameProps} props - Root component props
 * @param {LevelData} [props.customLevel] - Level JSON to load instead of the default world
 * @param {LevelData[]} [props.levelSequence] - Ordered levels; Enter after complete advances with carried score/lives
 * @param {() => void} [props.onClose] - Invoked when the player presses Escape outside the editor
 * @param {(result: MarioGameResult) => void} [props.onLevelComplete] - Fires once when the level completes
 * @param {boolean} [props.showEditor] - Start in the map editor when true
 * @returns {JSX.Element} Game UI with canvas and control hints
 */
export function MarioGame({
  customLevel,
  documentCampaign = false,
  levelSequence,
  onClose,
  onLevelComplete,
  showEditor,
  spriteTheme = 'botvar',
}: MarioGameProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentLevel, setCurrentLevel] = useState<LevelData>(
    () => customLevel ?? levelSequence?.[0] ?? LevelLoader.createDefaultLevel(),
  )
  const [editorMode, setEditorMode] = useState(Boolean(showEditor))

  const [initialGameState] = useState(() => createInitialGameState(currentLevel, { spriteTheme }))
  const gameStateRef = useRef(initialGameState)
  const workflowRef = useRef(documentCampaign && !customLevel && Boolean(levelSequence?.length))
  const [milestone, setMilestone] = useState(() => (workflowRef.current ? getBotvarMilestone(initialGameState) : null))
  const displayedMilestoneRef = useRef(milestone)
  const [history, setHistory] = useState(() => (milestone ? [milestone] : []))
  const [status, setStatus] = useState<MarioGameState['gameStatus']>('playing')
  const displayedStatusRef = useRef(status)
  const keyStateRef = useRef<KeyState>({
    down: false,
    jump: false,
    left: false,
    right: false,
    run: false,
    up: false,
  })
  const jumpLatchedRef = useRef(false)
  const fireLatchedRef = useRef(false)
  const gamepadJumpPrevRef = useRef(false)
  const gamepadFirePrevRef = useRef(false)
  const sequenceIndexRef = useRef(0)
  const levelSequenceRef = useRef(levelSequence)
  levelSequenceRef.current = levelSequence
  const completeNotifiedRef = useRef(false)
  const onLevelCompleteRef = useRef(onLevelComplete)
  onLevelCompleteRef.current = onLevelComplete

  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const showLeaderboardRef = useRef(false)
  const gameOverHandledRef = useRef(false)
  const leaderboardVariantRef = useRef<'complete' | 'gameOver'>('gameOver')

  const lastTimeRef = useRef(0) // set when the loop starts
  const accRef = useRef(0)
  const rafRef = useRef(0)

  const syncKeysToInput = useCallback((): GameInputSnapshot => {
    return buildGameInputSnapshot(
      keyStateRef.current,
      jumpLatchedRef,
      fireLatchedRef,
      gamepadJumpPrevRef,
      gamepadFirePrevRef,
    )
  }, [])

  const restartOrAdvance = useCallback(() => {
    const st = gameStateRef.current
    const seq = levelSequence
    const canNext = seq !== undefined && st.gameStatus === 'complete' && sequenceIndexRef.current < seq.length - 1

    if (canNext && seq) {
      sequenceIndexRef.current++
      const next = seq[sequenceIndexRef.current]
      setCurrentLevel(next)
      const nextState = createInitialGameState(next, {
        levelNumber: sequenceIndexRef.current + 1,
        lives: st.player.lives,
        score: st.score,
        spriteTheme,
      })
      gameStateRef.current =
        workflowRef.current && sequenceIndexRef.current === 2 ? startBotvarProofroom(nextState) : nextState
    } else {
      if (levelSequence && (st.gameStatus === 'gameOver' || sequenceIndexRef.current >= levelSequence.length - 1)) {
        sequenceIndexRef.current = 0
      }
      const level =
        customLevel ?? levelSequence?.[sequenceIndexRef.current] ?? currentLevel ?? LevelLoader.createDefaultLevel()
      setCurrentLevel(level)
      workflowRef.current = documentCampaign && !customLevel && Boolean(seq?.includes(level))
      gameStateRef.current = createInitialGameState(level, {
        levelNumber: levelSequence ? sequenceIndexRef.current + 1 : 1,
        spriteTheme,
      })
    }
    const opening = workflowRef.current ? getBotvarMilestone(gameStateRef.current) : null
    displayedMilestoneRef.current = opening
    setMilestone(opening)
    setHistory(opening ? [opening] : [])
    clearMarioKeyboardInput({ keyStateRef, jumpLatchedRef, fireLatchedRef })
    canvasRef.current?.focus()
    completeNotifiedRef.current = false
    gameOverHandledRef.current = false
    setShowLeaderboard(false)
    showLeaderboardRef.current = false
  }, [currentLevel, customLevel, documentCampaign, levelSequence, spriteTheme])

  const handlePlayTestLevel = useCallback(
    (level: LevelData) => {
      workflowRef.current = false
      setCurrentLevel(level)
      gameStateRef.current = createInitialGameState(level, { spriteTheme })
      sequenceIndexRef.current = 0
      completeNotifiedRef.current = false
      setEditorMode(false)
    },
    [spriteTheme],
  )

  const handleSaveLevel = useCallback((level: LevelData) => {
    setCurrentLevel(level)
    console.log('Level saved:', level.name)
  }, [])

  useEffect(() => {
    if (editorMode) return
    canvasRef.current?.focus()
  }, [editorMode])

  useEffect(() => {
    if (editorMode) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const loop = (t: number) => {
      const dt = Math.min((t - lastTimeRef.current) / 1000, 0.12)
      lastTimeRef.current = t
      accRef.current += dt

      while (accRef.current >= FIXED_DT) {
        const before = gameStateRef.current.gameStatus
        const input = syncKeysToInput()
        gameStateRef.current = advanceGameState(gameStateRef.current, input)
        accRef.current -= FIXED_DT

        const after = gameStateRef.current.gameStatus
        if (before !== 'complete' && after === 'complete' && !completeNotifiedRef.current) {
          completeNotifiedRef.current = true
          onLevelCompleteRef.current?.(buildMarioGameResult(gameStateRef.current))

          const seq = levelSequenceRef.current
          const isLastLevel = seq !== undefined && sequenceIndexRef.current >= seq.length - 1
          if (isLastLevel) {
            leaderboardVariantRef.current = 'complete'
            showLeaderboardRef.current = true
            setShowLeaderboard(true)
          }
        }

        if (before !== 'gameOver' && after === 'gameOver' && !gameOverHandledRef.current) {
          gameOverHandledRef.current = true
          leaderboardVariantRef.current = 'gameOver'
          showLeaderboardRef.current = true
          setShowLeaderboard(true)
        }
      }

      const seq = levelSequenceRef.current
      const nextStatus = gameStateRef.current.gameStatus
      if (displayedStatusRef.current !== nextStatus) {
        displayedStatusRef.current = nextStatus
        setStatus(nextStatus)
      }
      const hasNextCampaignLevel =
        gameStateRef.current.gameStatus === 'complete' && seq !== undefined && sequenceIndexRef.current < seq.length - 1
      const nextMilestone = workflowRef.current ? getBotvarMilestone(gameStateRef.current) : null
      if (displayedMilestoneRef.current !== nextMilestone) {
        displayedMilestoneRef.current = nextMilestone
        setMilestone(nextMilestone)
        if (nextMilestone) setHistory((previous) => [...previous, nextMilestone])
      }
      drawGame(canvas, gameStateRef.current, { hasNextCampaignLevel, workflow: workflowRef.current })
      rafRef.current = requestAnimationFrame(loop)
    }

    lastTimeRef.current = performance.now()
    accRef.current = 0
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [editorMode, syncKeysToInput])

  useEffect(() => {
    const deps = {
      editorMode,
      fireLatchedRef,
      gameStateRef,
      jumpLatchedRef,
      keyStateRef,
      onClose,
      restartOrAdvance,
      setEditorMode,
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (showLeaderboardRef.current) return
      handleMarioKeyDown(event, deps)
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (showLeaderboardRef.current) return
      handleMarioKeyUp(event, keyStateRef)
    }

    const clearKeys = () => clearMarioKeyboardInput(deps)
    const onVisibility = () => {
      if (document.hidden) clearKeys()
    }
    document.addEventListener('visibilitychange', onVisibility)
    globalThis.addEventListener('blur', clearKeys)
    globalThis.addEventListener('keydown', onKeyDown)
    globalThis.addEventListener('keyup', onKeyUp)
    return () => {
      globalThis.removeEventListener('blur', clearKeys)
      document.removeEventListener('visibilitychange', onVisibility)
      globalThis.removeEventListener('keydown', onKeyDown)
      globalThis.removeEventListener('keyup', onKeyUp)
    }
  }, [editorMode, onClose, restartOrAdvance])

  if (editorMode) {
    return (
      <MapEditor
        initialLevel={currentLevel || LevelLoader.createDefaultLevel()}
        onClose={() => setEditorMode(false)}
        onPlayTest={handlePlayTestLevel}
        onSave={handleSaveLevel}
      />
    )
  }

  const botvar = spriteTheme === 'botvar'
  const stageName = milestone ? BOTVAR_STAGE_TITLES[sequenceIndexRef.current] : currentLevel.name

  return (
    <div className="mario-game" lang="nb">
      <header className="mario-game-header">
        <div>
          <h1>{botvar ? 'Botvar' : 'Super Mario Bros. – klassisk tema'}</h1>
          <p>{currentLevel.name === stageName ? stageName : `${currentLevel.name} · ${stageName}`}</p>
        </div>
        <button className="game-exit" onClick={onClose} type="button">
          Avslutt <kbd>Esc</kbd>
        </button>
      </header>
      <div className="mario-game-canvas-container">
        <canvas
          aria-label={`Spillflate for ${botvar ? 'Botvar' : 'Mario'}`}
          className="mario-game-canvas"
          height={MARIO_CANVAS_HEIGHT}
          ref={canvasRef}
          tabIndex={0}
          width={MARIO_CANVAS_WIDTH}
        />
        <span aria-label="Spillstatus" className="sr-only" role="status">
          {{ playing: 'Spiller', paused: 'Pause', complete: 'Fullført', gameOver: 'Spillet er slutt' }[status]}
        </span>
        {showLeaderboard && (
          <LeaderboardOverlay
            onDone={restartOrAdvance}
            score={gameStateRef.current.score}
            variant={leaderboardVariantRef.current}
          />
        )}
      </div>
      {milestone && (
        <section className="document-status" role="status" aria-label="Dokumentstatus" aria-atomic="true">
          <strong>{milestone.title}</strong>
          <p>{milestone.detail}</p>
        </section>
      )}
      {milestone && history.length > 1 && status === 'paused' && (
        <details className="document-history">
          <summary>Hendelser på banen</summary>
          <ol>
            {history.map((entry) => (
              <li key={entry.title + entry.detail}>{entry.detail}</li>
            ))}
          </ol>
        </details>
      )}
      <div className="mario-game-controls" aria-label="Tastaturkontroller">
        <span>
          <kbd>← →</kbd> eller <kbd>A D</kbd> Flytt
        </span>
        <span>
          <kbd>Mellomrom</kbd> Hopp
        </span>
        <span>
          <kbd>Shift</kbd> Løp
        </span>
        <span>
          <kbd>F</kbd> Skyt
        </span>
        <span>
          <kbd>P</kbd> Pause
        </span>
        <span>
          <kbd>E</kbd> Baneredigering
        </span>
      </div>
    </div>
  )
}
