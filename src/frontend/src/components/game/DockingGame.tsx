import { type JSX, useCallback, useEffect, useState } from 'react'

import type { DockingGameState, Ship } from './types'

import './DockingGame.css'

interface DockingGameProps {
  readonly onComplete: (success: boolean, bonus: number) => void
  readonly ship: Ship
}

/**
 * Simple docking mini-game component
 * @param {DockingGameProps} props - Component properties
 * @returns {JSX.Element} The docking game interface
 */
export function DockingGame({ onComplete, ship }: DockingGameProps): JSX.Element {
  const [gameState, setGameState] = useState<DockingGameState>({
    docked: false,
    obstacles: [
      // Harbor entrance walls (create a channel)
      { height: 80, width: 15, x: 0, y: 0 },        // Top entrance wall
      { height: 80, width: 15, x: 0, y: 320 },      // Bottom entrance wall
      
      // Main harbor walls
      { height: 15, width: 120, x: 15, y: 0 },       // Top wall
      { height: 15, width: 120, x: 15, y: 385 },     // Bottom wall
      { height: 120, width: 15, x: 485, y: 0 },      // Right wall top
      { height: 120, width: 15, x: 485, y: 280 },    // Right wall bottom
      
      // Pier 1 - extending from top
      { height: 15, width: 80, x: 135, y: 15 },      // Pier base
      { height: 60, width: 15, x: 135, y: 30 },      // Pier extending down
      { height: 60, width: 15, x: 200, y: 30 },      // Pier end
      
      // Pier 2 - extending from bottom  
      { height: 15, width: 90, x: 120, y: 370 },     // Pier base
      { height: 70, width: 15, x: 120, y: 300 },     // Pier extending up
      { height: 70, width: 15, x: 195, y: 300 },     // Pier end
      
      // Pier 3 - middle pier from right
      { height: 80, width: 15, x: 470, y: 140 },     // Pier base
      { height: 15, width: 60, x: 410, y: 140 },     // Pier extending left
      { height: 15, width: 60, x: 410, y: 205 },     // Pier bottom
      
      // Central navigation hazards
      { height: 25, width: 25, x: 280, y: 120 },     // Small obstacle
      { height: 30, width: 20, x: 320, y: 250 },     // Navigation buoy
      
      // Breakwater sections
      { height: 20, width: 45, x: 240, y: 80 },      // Breakwater piece 1
      { height: 20, width: 35, x: 290, y: 300 },     // Breakwater piece 2
    ],
    shipAngle: 0,
    shipSpeed: 0,
    shipX: 25,        // Start in the entrance channel
    shipY: 200,       // Middle of entrance
    targetX: 425,     // Deep in the harbor
    targetY: 180,     // Near a pier
    timeLeft: 60
  })

  const [keys, setKeys] = useState<Set<string>>(new Set())

  const checkCollision = useCallback((x: number, y: number): boolean => {
    return gameState.obstacles.some(obstacle => 
      x >= obstacle.x && 
      x <= obstacle.x + obstacle.width &&
      y >= obstacle.y && 
      y <= obstacle.y + obstacle.height
    )
  }, [gameState.obstacles])

  const checkDocking = useCallback((x: number, y: number): boolean => {
    const distance = Math.sqrt(
      Math.pow(x - gameState.targetX, 2) + 
      Math.pow(y - gameState.targetY, 2)
    )
    return distance < 30 && gameState.shipSpeed < 2
  }, [gameState.targetX, gameState.targetY, gameState.shipSpeed])

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
        if (prev.docked || prev.timeLeft <= 0) return prev

        let newSpeed = prev.shipSpeed
        let newAngle = prev.shipAngle

        // Handle input
        if (keys.has('ArrowUp')) newSpeed = Math.min(5, newSpeed + 0.2)
        if (keys.has('ArrowDown')) newSpeed = Math.max(0, newSpeed - 0.3)
        if (keys.has('ArrowLeft')) newAngle -= 3
        if (keys.has('ArrowRight')) newAngle += 3

        // Apply momentum
        newSpeed *= 0.98

        // Calculate new position
        const radians = (newAngle * Math.PI) / 180
        const newX = prev.shipX + Math.cos(radians) * newSpeed
        const newY = prev.shipY + Math.sin(radians) * newSpeed

        // Check boundaries
        const boundedX = Math.max(10, Math.min(490, newX))
        const boundedY = Math.max(10, Math.min(390, newY))

        // Check collision
        if (checkCollision(boundedX, boundedY)) {
          return { ...prev, shipSpeed: 0 }
        }

        // Check docking
        const docked = checkDocking(boundedX, boundedY)

        return {
          ...prev,
          docked,
          shipAngle: newAngle,
          shipSpeed: newSpeed,
          shipX: boundedX,
          shipY: boundedY
        }
      })
    }, 16) // ~60 FPS for smooth movement

    return () => clearInterval(gameLoop)
  }, [keys, checkCollision, checkDocking])

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
    if (gameState.docked) {
      const bonus = Math.floor((gameState.timeLeft / 60) * 2000) + 500
      onComplete(true, bonus)
    } else if (gameState.timeLeft <= 0) {
      onComplete(false, 0)
    }
  }, [gameState.docked, gameState.timeLeft, onComplete])

  return (
    <div className="docking-game">
      <div className="game-info">
        <h2>Dock the {ship.name}</h2>
        <p>Time: {gameState.timeLeft}s | Speed: {gameState.shipSpeed.toFixed(1)}</p>
        <p>Use arrow keys to navigate. Dock slowly at the green target!</p>
      </div>
      
      <div className="game-area">
        {/* Water background */}
        <div className="water" />
        
        {/* Obstacles */}
        {gameState.obstacles.map((obstacle) => (
          <div
            className="obstacle"
            key={`obstacle-${obstacle.x}-${obstacle.y}`}
            style={{
              height: obstacle.height,
              left: obstacle.x,
              top: obstacle.y,
              width: obstacle.width
            }}
          />
        ))}
        
        {/* Docking target */}
        <div
          className="docking-target"
          style={{
            left: gameState.targetX - 25,
            top: gameState.targetY - 25
          }}
        />
        
        {/* Ship */}
        <div
          className="ship"
          style={{
            left: gameState.shipX - 15,
            top: gameState.shipY - 10,
            transform: `rotate(${gameState.shipAngle}deg)`
          }}
        />
      </div>
    </div>
  )
}
