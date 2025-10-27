import { type JSX, useCallback, useEffect, useRef, useState } from 'react'

import type { Ship } from './types'

import './BaseMaritimeGame.css'

export interface BaseGameState {
  docked: boolean
  hasCollided: boolean
  message: string
  messageType: string
  obstacles: GameObstacle[]
  shipAngle: number
  shipSpeed: number
  shipX: number
  shipY: number
  targetX: number
  targetY: number
  timeLeft: number
}

export interface GameObstacle {
  height: number
  type?: 'hazard' | 'pier' | 'ship' | 'wall'
  width: number
  x: number
  y: number
}

interface BaseGameProps {
  readonly gameType: 'docking' | 'undocking'
  readonly onComplete: (success: boolean, bonus: number, penalty?: number) => void
  readonly ship: Ship
}

/**
 * Base game component for both docking and undocking
 * @param {object} root0 - The component props
 * @param {BaseGameProps['gameType']} root0.gameType - The type of game (docking or undocking)
 * @param {BaseGameProps['onComplete']} root0.onComplete - Callback function called when game completes
 * @param {BaseGameProps['ship']} root0.ship - The ship object containing ship properties
 * @returns {JSX.Element} The rendered maritime game component
 */
export function BaseMaritimeGame({ gameType, onComplete, ship }: BaseGameProps): JSX.Element {
  const completionRef = useRef(false)
  const [gameState, setGameState] = useState<BaseGameState>(() => getInitialGameState(gameType))
  const [keys, setKeys] = useState<Set<string>>(new Set())

  const checkCollision = useCallback((x: number, y: number): boolean => {
    return gameState.obstacles.some(obstacle => 
      x >= obstacle.x && 
      x <= obstacle.x + obstacle.width &&
      y >= obstacle.y && 
      y <= obstacle.y + obstacle.height
    )
  }, [gameState.obstacles])

  const checkCompletion = useCallback((x: number, y: number): boolean => {
    const distance = Math.sqrt(
      Math.pow(x - gameState.targetX, 2) + 
      Math.pow(y - gameState.targetY, 2)
    )
    return distance < 30 && gameState.shipSpeed < 2
  }, [gameState.targetX, gameState.targetY, gameState.shipSpeed])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default behavior for arrow keys to avoid page scrolling
      if (['a', 'A', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'd', 'D', 's', 'S', 'w', 'W'].includes(event.key)) {
        event.preventDefault()
      }
      setKeys(prev => new Set(prev).add(event.key))
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (['a', 'A', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'd', 'D', 's', 'S', 'w', 'W'].includes(event.key)) {
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

        let newAngle = prev.shipAngle
        let newSpeed = prev.shipSpeed

        // Rotation (steering)
        if (keys.has('ArrowLeft') || keys.has('a') || keys.has('A')) {
          newAngle -= 3
        }
        if (keys.has('ArrowRight') || keys.has('d') || keys.has('D')) {
          newAngle += 3
        }

        // Acceleration/deceleration
        if (keys.has('ArrowUp') || keys.has('w') || keys.has('W')) {
          newSpeed = Math.min(newSpeed + 0.1, 5)
        }
        if (keys.has('ArrowDown') || keys.has('s') || keys.has('S')) {
          newSpeed = Math.max(newSpeed - 0.2, 0)
        }

        // Natural deceleration
        if (!keys.has('ArrowUp') && !keys.has('w') && !keys.has('W')) {
          newSpeed = Math.max(newSpeed - 0.05, 0)
        }

        // Calculate movement based on angle and speed
        const radians = (newAngle * Math.PI) / 180
        const deltaX = Math.cos(radians) * newSpeed
        const deltaY = Math.sin(radians) * newSpeed

        let newX = prev.shipX + deltaX
        let newY = prev.shipY + deltaY

        // Boundary checks
        const boundedX = Math.max(0, Math.min(500 - 30, newX))
        const boundedY = Math.max(0, Math.min(400 - 20, newY))

        // Collision detection
        if (checkCollision(boundedX, boundedY)) {
          if (!prev.hasCollided) {
            return {
              ...prev,
              hasCollided: true,
              message: `${ship.name} has collided! Hull damage sustained.`,
              messageType: 'crash',
              shipSpeed: 0 
            }
          }
          return { ...prev, shipSpeed: 0 }
        }

        // Check completion
        const completed = checkCompletion(boundedX, boundedY)

        const newState = {
          ...prev,
          docked: completed,
          shipAngle: newAngle,
          shipSpeed: newSpeed,
          shipX: boundedX,
          shipY: boundedY
        }

        // If just completed successfully, show success message
        if (completed && !prev.docked) {
          if (gameType === 'docking') {
            newState.message = `Successfully docked ${ship.name}! Excellent seamanship!`
          } else {
            newState.message = `Successfully undocked ${ship.name}! Clear of the harbor!`
          }
          newState.messageType = 'success'
        }

        return newState
      })
    }, 16) // ~60 FPS for smooth movement

    return () => clearInterval(gameLoop)
  }, [keys, checkCollision, checkCompletion, ship.name, gameType])

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
    if (gameState.docked && !completionRef.current) {
      completionRef.current = true
      // Show success message for 2 seconds before completing
      setTimeout(() => {
        const bonus = Math.floor((gameState.timeLeft / 60) * 2000) + 500
        const penalty = gameState.hasCollided ? 5000 : 0 // $5000 penalty for collision damage
        onComplete(true, bonus, penalty)
      }, 2000)
    } else if (gameState.timeLeft <= 0 && !completionRef.current) {
      completionRef.current = true
      const penalty = gameState.hasCollided ? 5000 : 0
      // If crashed, you get towed (successful but with penalty)
      // If no crash, it's just a failed attempt
      const isTowed = gameState.hasCollided
      
      // Show appropriate message
      let towingDestination = 'to open water'
      if (gameType === 'docking') {
        towingDestination = 'to dock'
      }
      
      setGameState(prev => ({
        ...prev,
        message: isTowed 
          ? `Time's up! ${ship.name} was towed ${towingDestination} after collision damage.`
          : `Time's up! Failed to ${gameType} ${ship.name}.`,
        messageType: isTowed ? 'crash' : 'info'
      }))
      
      // Wait a moment to show the message, then complete
      setTimeout(() => {
        onComplete(isTowed, 0, penalty) // Towed ships are considered successful
      }, 2000)
    }
  }, [gameState.docked, gameState.timeLeft, gameState.hasCollided, onComplete, ship.name, gameType])

  const gameTitle = gameType === 'docking' ? `Dock the ${ship.name}` : `Undock the ${ship.name}`
  const instructions = gameType === 'docking' 
    ? 'Use arrow keys or WASD to navigate. Dock slowly at the green target!'
    : 'Use arrow keys or WASD to navigate. Exit slowly to the green target!'

  return (
    <div className={`maritime-game ${gameType}-game`}>
      <div className="game-info">
        <h2>{gameTitle}</h2>
        <p>Time: {gameState.timeLeft}s | Speed: {gameState.shipSpeed.toFixed(1)}</p>
        <p>{instructions}</p>
        {gameState.message && (
          <div className={`game-message ${gameState.messageType}`}>
            {gameState.message}
          </div>
        )}
      </div>
      
      <div className="game-area">
        {/* Water background */}
        <div className="water" />
        
        {/* Obstacles */}
        {gameState.obstacles.map((obstacle) => (
          <div
            className={`obstacle ${obstacle.type === 'ship' ? 'docked-ship' : ''}`}
            key={`obstacle-${obstacle.x}-${obstacle.y}-${obstacle.width}-${obstacle.height}`}
            style={{
              height: obstacle.height,
              left: obstacle.x,
              top: obstacle.y,
              width: obstacle.width
            }}
          />
        ))}
        
        {/* Target */}
        <div
          className={gameType === 'docking' ? 'docking-target' : 'undocking-target'}
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

/**
 * Creates the initial game state based on the game type
 * @param {('docking' | 'undocking')} gameType - The type of game to initialize
 * @returns {BaseGameState} The initial game state object
 */
function getInitialGameState(gameType: 'docking' | 'undocking'): BaseGameState {
  const commonObstacles: GameObstacle[] = [
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
  ]

  // Add docked ships as obstacles
  const dockedShips: GameObstacle[] = [
    // Docked ships at Pier 1 (top pier)
    { height: 15, type: 'ship', width: 35, x: 160, y: 30 },      // Container ship at pier 1
    
    // Docked ships at Pier 2 (bottom pier)
    { height: 15, type: 'ship', width: 40, x: 140, y: 300 },     // Cargo ship at pier 2
    
    // Docked ships at Pier 3 (right pier)
    { height: 15, type: 'ship', width: 30, x: 430, y: 155 },     // Tanker at pier 3
    
    // Additional docked ships along the harbor walls
    { height: 15, type: 'ship', width: 25, x: 350, y: 15 },      // Small vessel at top wall
    { height: 15, type: 'ship', width: 30, x: 220, y: 370 },     // Medium ship at bottom wall
    
    // Moored boats near entrance
    { height: 12, type: 'ship', width: 20, x: 60, y: 100 },      // Small boat near entrance
    { height: 12, type: 'ship', width: 20, x: 80, y: 300 },      // Another small boat
  ]

  const allObstacles = [...commonObstacles, ...dockedShips]

  if (gameType === 'docking') {
    return {
      docked: false,
      hasCollided: false,
      message: '',
      messageType: '',
      obstacles: allObstacles,
      shipAngle: 0,
      shipSpeed: 0,
      shipX: 25,        // Start in the entrance channel
      shipY: 200,       // Middle of entrance
      targetX: 425,     // Deep in the harbor
      targetY: 180,     // Near a pier
      timeLeft: 60
    }
  } else {
    // Undocking: reverse start and target positions
    return {
      docked: false,
      hasCollided: false,
      message: '',
      messageType: '',
      obstacles: allObstacles,
      shipAngle: 180,   // Face toward exit
      shipSpeed: 0,
      shipX: 425,       // Start at the dock
      shipY: 180,       // Near a pier
      targetX: 25,      // Target is the entrance channel
      targetY: 200,     // Middle of entrance
      timeLeft: 60
    }
  }
}
  