import { type JSX, useCallback, useEffect, useState } from 'react'

import type { RescueGameState, Ship } from './types'

import './RescueGame.css'

interface RescueGameProps {
  readonly onComplete: (success: boolean, bonus: number, penalty?: number) => void
  readonly ship: Ship
}

/**
 * Simple rescue mini-game component
 * @param {RescueGameProps} props - Component properties
 * @returns {JSX.Element} The rescue game interface
 */
export function RescueGame({ onComplete, ship }: RescueGameProps): JSX.Element {
  const [gameState, setGameState] = useState<RescueGameState>({
    boatX: 250,
    boatY: 350,
    rescuedCount: 0,
    survivors: [
      { id: 'survivor1', rescued: false, x: 100, y: 100 },
      { id: 'survivor2', rescued: false, x: 300, y: 150 },
      { id: 'survivor3', rescued: false, x: 450, y: 200 },
      { id: 'survivor4', rescued: false, x: 200, y: 250 },
      { id: 'survivor5', rescued: false, x: 400, y: 300 }
    ],
    timeLeft: 90,
    waves: [
      { height: 20, x: 0, y: 100 },
      { height: 25, x: 150, y: 200 },
      { height: 30, x: 350, y: 150 }
    ]
  })

  const [keys, setKeys] = useState<Set<string>>(new Set())

  const checkRescue = useCallback((boatX: number, boatY: number, currentSurvivors: RescueGameState['survivors']) => {
    const updatedSurvivors = currentSurvivors.map(survivor => {
      if (!survivor.rescued) {
        const distance = Math.sqrt(
          Math.pow(boatX - survivor.x, 2) + 
          Math.pow(boatY - survivor.y, 2)
        )
        if (distance < 25) {
          return { ...survivor, rescued: true }
        }
      }
      return survivor
    })
    
    let rescuedCount = 0
    for (const survivor of updatedSurvivors) {
      if (survivor.rescued) rescuedCount++
    }
    
    return { rescuedCount, survivors: updatedSurvivors }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default behavior for arrow keys to avoid page scrolling
      if (['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp'].includes(event.key)) {
        event.preventDefault()
      }
      setKeys(prev => new Set(prev).add(event.key))
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp'].includes(event.key)) {
        event.preventDefault()
      }
      setKeys(prev => {
        const newKeys = new Set(prev)
        newKeys.delete(event.key)
        return newKeys
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useEffect(() => {
    const gameLoop = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 0) return prev

        let newX = prev.boatX
        let newY = prev.boatY

        // Handle input with faster movement
        if (keys.has('ArrowLeft')) newX = Math.max(20, newX - 8)
        if (keys.has('ArrowRight')) newX = Math.min(480, newX + 8)
        if (keys.has('ArrowUp')) newY = Math.max(20, newY - 8)
        if (keys.has('ArrowDown')) newY = Math.min(380, newY + 8)

        // Check for rescues
        const rescueResult = checkRescue(newX, newY, prev.survivors)

        return {
          ...prev,
          boatX: newX,
          boatY: newY,
          rescuedCount: rescueResult.rescuedCount,
          survivors: rescueResult.survivors
        }
      })
    }, 16) // ~60 FPS for smooth movement

    return () => clearInterval(gameLoop)
  }, [keys, checkRescue])

  useEffect(() => {
    // Separate timer for game time countdown
    const timeTimer = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        timeLeft: Math.max(0, prev.timeLeft - 1)
      }))
    }, 1000) // 1 second intervals for time countdown

    return () => clearInterval(timeTimer)
  }, [])

  useEffect(() => {
    if (gameState.rescuedCount === gameState.survivors.length) {
      const bonus = Math.floor((gameState.timeLeft / 90) * 3000) + 1000
      onComplete(true, bonus, 0)
    } else if (gameState.timeLeft <= 0) {
      const bonus = gameState.rescuedCount * 200
      onComplete(gameState.rescuedCount > 0, bonus, 0)
    }
  }, [gameState.rescuedCount, gameState.survivors.length, gameState.timeLeft, onComplete])

  return (
    <div className="rescue-game">
      <div className="game-info">
        <h2>Rescue Mission - {ship.name}</h2>
        <p>Time: {gameState.timeLeft}s | Rescued: {gameState.rescuedCount}/{gameState.survivors.length}</p>
        <p>Use arrow keys to navigate and rescue all survivors!</p>
      </div>
      
      <div className="game-area">
        {/* Ocean background */}
        <div className="ocean" />
        
        {/* Waves */}
        {gameState.waves.map((wave) => (
          <div
            className="wave"
            key={`wave-${wave.x}-${wave.y}`}
            style={{
              height: wave.height,
              left: wave.x,
              top: wave.y,
              width: wave.height * 3
            }}
          />
        ))}
        
        {/* Survivors */}
        {gameState.survivors.map((survivor) => (
          <div
            className={`survivor ${survivor.rescued ? 'rescued' : ''}`}
            key={survivor.id}
            style={{
              left: survivor.x - 10,
              top: survivor.y - 10
            }}
          />
        ))}
        
        {/* Rescue boat */}
        <div
          className="rescue-boat"
          style={{
            left: gameState.boatX - 15,
            top: gameState.boatY - 10
          }}
        />
      </div>
    </div>
  )
}
