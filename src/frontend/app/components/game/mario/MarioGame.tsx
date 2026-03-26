import { type JSX, useCallback, useEffect, useRef, useState } from 'react'

import type { LevelData } from './level-format'
import type { GameInputSnapshot, KeyState, MarioGameResult, MarioGameState } from './mario-types'

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
import { handleMarioKeyDown, handleMarioKeyUp } from './mario-keyboard'
import './MarioGame.css'

/** Props for the Mario canvas game shell (play, editor, level chain, callbacks). */
export interface MarioGameProps {
  readonly customLevel?: LevelData
  readonly levelSequence?: LevelData[]
  readonly onClose?: () => void
  readonly onLevelComplete?: (result: MarioGameResult) => void
  readonly showEditor?: boolean
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
  levelSequence,
  onClose,
  onLevelComplete,
  showEditor,
}: MarioGameProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const resolvedLevel = customLevel ?? levelSequence?.[0] ?? LevelLoader.createDefaultLevel()
  const [currentLevel, setCurrentLevel] = useState<LevelData>(() => resolvedLevel)
  const [editorMode, setEditorMode] = useState(Boolean(showEditor))

  const gameStateRef = useRef<MarioGameState>(createInitialGameState(currentLevel))
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

  const lastTimeRef = useRef(performance.now())
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
    const canNext =
      seq !== undefined &&
      st.gameStatus === 'complete' &&
      sequenceIndexRef.current < seq.length - 1

    if (canNext && seq) {
      sequenceIndexRef.current++
      const next = seq[sequenceIndexRef.current]
      setCurrentLevel(next)
      gameStateRef.current = createInitialGameState(next, {
        levelNumber: sequenceIndexRef.current + 1,
        lives: st.player.lives,
        score: st.score,
      })
    } else {
      if (st.gameStatus === 'complete' && levelSequence && sequenceIndexRef.current >= levelSequence.length - 1) {
        sequenceIndexRef.current = 0
      }
      const level =
        customLevel ?? levelSequence?.[sequenceIndexRef.current] ?? currentLevel ?? LevelLoader.createDefaultLevel()
      setCurrentLevel(level)
      gameStateRef.current = createInitialGameState(level, {
        levelNumber: levelSequence ? sequenceIndexRef.current + 1 : 1,
      })
    }
    completeNotifiedRef.current = false
    gameOverHandledRef.current = false
    setShowLeaderboard(false)
    showLeaderboardRef.current = false
  }, [currentLevel, customLevel, levelSequence])

  const handlePlayTestLevel = useCallback((level: LevelData) => {
    setCurrentLevel(level)
    gameStateRef.current = createInitialGameState(level)
    sequenceIndexRef.current = 0
    completeNotifiedRef.current = false
    setEditorMode(false)
  }, [])

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
        gameStateRef.current = advanceGameState(gameStateRef.current, input, performance.now())
        accRef.current -= FIXED_DT

        const after = gameStateRef.current.gameStatus
        if (before !== 'complete' && after === 'complete' && !completeNotifiedRef.current) {
          completeNotifiedRef.current = true
          onLevelCompleteRef.current?.(buildMarioGameResult(gameStateRef.current))
        }

        if (before !== 'gameOver' && after === 'gameOver' && !gameOverHandledRef.current) {
          gameOverHandledRef.current = true
          showLeaderboardRef.current = true
          setShowLeaderboard(true)
        }
      }

      const seq = levelSequenceRef.current
      const hasNextCampaignLevel =
        gameStateRef.current.gameStatus === 'complete' &&
        seq !== undefined &&
        sequenceIndexRef.current < seq.length - 1
      drawGame(canvas, gameStateRef.current, { hasNextCampaignLevel })
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

    globalThis.addEventListener('keydown', onKeyDown)
    globalThis.addEventListener('keyup', onKeyUp)
    return () => {
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

  return (
    <div className="mario-game">
      <div className="mario-game-header">
        <h1>Super Mario Bros Clone</h1>
        <button className="close-button" onClick={onClose} type="button">
          ✕
        </button>
      </div>

      <div className="mario-game-canvas-container" style={{ position: 'relative' }}>
        <canvas
          className="mario-game-canvas"
          height={MARIO_CANVAS_HEIGHT}
          ref={canvasRef}
          tabIndex={0}
          width={MARIO_CANVAS_WIDTH}
        />
        {showLeaderboard && (
          <LeaderboardOverlay onDone={restartOrAdvance} score={gameStateRef.current.score} />
        )}
      </div>

      <div className="mario-game-controls">
        <h3>Controls:</h3>
        <p>Arrow Keys / WASD: Move</p>
        <p>Space / Up Arrow: Jump</p>
        <p>Shift: Run</p>
        <p>Z / F: Fireball (with fire flower)</p>
        <p>P: Pause / resume</p>
        <p>Goal: Reach the flag pole at the end.</p>
        <p>Higher on the pole = more points (100–5000).</p>
        <p>Gamepad: stick / d-pad, A jump, B fire, shoulder buttons run.</p>
        <p>E: Open Map Editor</p>
        <p>ESC: Exit Game</p>
        <p>R: Restart after game over</p>
        <p>Enter: Continue after you clear a level (score and lives carry over in campaign)</p>
        {levelSequence && levelSequence.length > 1 ? (
          <p>Campaign: {levelSequence.length} levels (press Enter at the level-clear screen to go on).</p>
        ) : null}
      </div>
    </div>
  )
}
