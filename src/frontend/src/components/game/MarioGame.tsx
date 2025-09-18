/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable sonarjs/pseudo-random */
import { type JSX, useCallback, useEffect, useRef, useState } from 'react'

import type { 
  Collectible, 
  Enemy, 
  KeyState, 
  MarioGameState, 
  Platform, 
  Player 
} from './mario-types'

import './MarioGame.css'

interface MarioGameProps {
  readonly onClose?: () => void
}

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 400
const GRAVITY = 0.5
const PLAYER_SPEED = 3
const JUMP_FORCE = 12
const RUN_MULTIPLIER = 1.5

// Initialize game state
const createInitialGameState = (): MarioGameState => {
  const player: Player = {
    facing: 'right',
    height: 32,
    invulnerable: false,
    isJumping: false,
    isRunning: false,
    lives: 3,
    onGround: false,
    powerUp: 'small',
    velocityX: 0,
    velocityY: 0,
    width: 32,
    x: 50,
    y: 200
  }

  // Create a simple level with platforms
  const platforms: Platform[] = [
    // Ground
    { breakable: false, height: 50, solid: true, type: 'ground', width: 2000, x: 0, y: 350 },
    // Floating platforms
    { breakable: true, height: 20, solid: true, type: 'brick', width: 100, x: 200, y: 300 },
    { breakable: true, height: 20, solid: true, type: 'brick', width: 100, x: 400, y: 250 },
    { breakable: false, height: 20, solid: true, type: 'cloud', width: 100, x: 600, y: 200 },
    { breakable: false, height: 20, solid: true, type: 'cloud', width: 100, x: 800, y: 150 },
    // Pipes
    { breakable: false, height: 100, solid: true, type: 'pipe', width: 60, x: 1000, y: 250 },
    { breakable: false, height: 150, solid: true, type: 'pipe', width: 60, x: 1200, y: 200 }
  ]

  // Create enemies
  const enemies: Enemy[] = [
    { 
      alive: true, 
      direction: 'left', 
      height: 24, 
      id: 'goomba1', 
      type: 'goomba', 
      velocityX: -2, 
      velocityY: 0, 
      width: 24, 
      x: 300, 
      y: 318 
    },
    { 
      alive: true, 
      direction: 'left', 
      height: 24, 
      id: 'goomba2', 
      type: 'goomba', 
      velocityX: -1.5, 
      velocityY: 0, 
      width: 24, 
      x: 500, 
      y: 318 
    },
    { 
      alive: true, 
      direction: 'left', 
      height: 32, 
      id: 'koopa1', 
      type: 'koopa', 
      velocityX: -2.5, 
      velocityY: 0, 
      width: 28, 
      x: 700, 
      y: 310 
    }
  ]

  // Create collectibles
  const collectibles: Collectible[] = [
    { collected: false, height: 16, id: 'coin1', type: 'coin', value: 100, width: 16, x: 230, y: 270 },
    { collected: false, height: 16, id: 'coin2', type: 'coin', value: 100, width: 16, x: 430, y: 220 },
    { collected: false, height: 16, id: 'coin3', type: 'coin', value: 100, width: 16, x: 630, y: 170 },
    { collected: false, height: 24, id: 'mushroom1', type: 'mushroom', value: 1000, width: 24, x: 850, y: 120 }
  ]

  return {
    cameraX: 0,
    collectibles,
    enemies,
    gameStatus: 'playing',
    gameTime: 0,
    level: 1,
    levelHeight: 400,
    levelWidth: 2000,
    particles: [],
    platforms,
    player,
    score: 0
  }
}

/**
 * Mario-style side-scrolling platform game
 * @param {MarioGameProps} props - Component properties
 * @returns {JSX.Element} The game interface
 */
export function MarioGame({ onClose }: MarioGameProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<MarioGameState>(createInitialGameState)
  const [keyState, setKeyState] = useState<KeyState>({
    down: false,
    jump: false,
    left: false,
    right: false,
    run: false,
    up: false
  })
  const gameLoopRef = useRef<number>(0)

  // Handle keyboard input
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.code) {
      case 'ArrowDown':
      case 'KeyS':
        setKeyState(prev => ({ ...prev, down: true }))
        break
      case 'ArrowLeft':
      case 'KeyA':
        setKeyState(prev => ({ ...prev, left: true }))
        break
      case 'ArrowRight':
      case 'KeyD':
        setKeyState(prev => ({ ...prev, right: true }))
        break
      case 'ArrowUp':
      case 'KeyW':
      case 'Space':
        setKeyState(prev => ({ ...prev, jump: true, up: true }))
        event.preventDefault()
        break
      case 'ShiftLeft':
      case 'ShiftRight':
        setKeyState(prev => ({ ...prev, run: true }))
        break
    }
  }, [])

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    switch (event.code) {
      case 'ArrowDown':
      case 'KeyS':
        setKeyState(prev => ({ ...prev, down: false }))
        break
      case 'ArrowLeft':
      case 'KeyA':
        setKeyState(prev => ({ ...prev, left: false }))
        break
      case 'ArrowRight':
      case 'KeyD':
        setKeyState(prev => ({ ...prev, right: false }))
        break
      case 'ArrowUp':
      case 'KeyW':
      case 'Space':
        setKeyState(prev => ({ ...prev, jump: false, up: false }))
        break
      case 'ShiftLeft':
      case 'ShiftRight':
        setKeyState(prev => ({ ...prev, run: false }))
        break
    }
  }, [])

  // Check collision between two rectangles
  const checkCollision = (rect1: { height: number; width: number; x: number; y: number; }, 
                         rect2: { height: number; width: number; x: number; y: number; }): boolean => {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y
  }

  // Game update logic
  const updateGame = useCallback(() => {
    setGameState(prevState => {
      if (prevState.gameStatus !== 'playing') return prevState

      const newState = { ...prevState }
      const player = { ...newState.player }

      // Update player movement
      player.isRunning = keyState.run
      const speed = player.isRunning ? PLAYER_SPEED * RUN_MULTIPLIER : PLAYER_SPEED

      if (keyState.left) {
        player.velocityX = -speed
        player.facing = 'left'
      } else if (keyState.right) {
        player.velocityX = speed
        player.facing = 'right'
      } else {
        player.velocityX *= 0.8 // Friction
      }

      // Jump
      if (keyState.jump && player.onGround) {
        player.velocityY = -JUMP_FORCE
        player.isJumping = true
        player.onGround = false
      }

      // Apply gravity
      player.velocityY += GRAVITY

      // Update player position
      player.x += player.velocityX
      player.y += player.velocityY

      // Platform collision
      player.onGround = false
      for (const platform of newState.platforms) {
        if (checkCollision(player, platform) && platform.solid) {
          // Landing on top
          if (player.velocityY > 0 && player.y < platform.y) {
            player.y = platform.y - player.height
            player.velocityY = 0
            player.onGround = true
            player.isJumping = false
          }
          // Hitting from below
          else if (player.velocityY < 0 && player.y > platform.y) {
            player.y = platform.y + platform.height
            player.velocityY = 0
          }
          // Side collision
          else if (player.velocityX > 0 && player.x < platform.x) {
            player.x = platform.x - player.width
          } else if (player.velocityX < 0 && player.x > platform.x) {
            player.x = platform.x + platform.width
          }
        }
      }

      // Keep player in bounds
      if (player.x < 0) player.x = 0
      if (player.y > newState.levelHeight) {
        // Player fell off the level
        player.lives--
        if (player.lives <= 0) {
          newState.gameStatus = 'gameOver'
        } else {
          // Reset player position
          player.x = 50
          player.y = 200
          player.velocityX = 0
          player.velocityY = 0
        }
      }

      // Update camera
      const targetCameraX = player.x - CANVAS_WIDTH / 2
      newState.cameraX = Math.max(0, Math.min(targetCameraX, newState.levelWidth - CANVAS_WIDTH))

      // Update enemies
      newState.enemies = newState.enemies.map(enemy => {
        if (!enemy.alive) return enemy

        const updatedEnemy = { ...enemy }
        
        // Apply gravity to enemies
        updatedEnemy.velocityY += GRAVITY * 0.5 // Lighter gravity for enemies
        
        // Update position
        updatedEnemy.x += updatedEnemy.velocityX
        updatedEnemy.y += updatedEnemy.velocityY
        
        // Platform collision for enemies
        let onGround = false
        for (const platform of newState.platforms) {
          if (checkCollision(updatedEnemy, platform) && platform.solid) {
            // Landing on top
            if (updatedEnemy.velocityY > 0 && updatedEnemy.y < platform.y) {
              updatedEnemy.y = platform.y - updatedEnemy.height
              updatedEnemy.velocityY = 0
              onGround = true
            }
            // Side collision - bounce off walls
            else if (updatedEnemy.velocityX > 0 && updatedEnemy.x < platform.x) {
              updatedEnemy.x = platform.x - updatedEnemy.width
              updatedEnemy.velocityX *= -1
              updatedEnemy.direction = updatedEnemy.direction === 'left' ? 'right' : 'left'
            } else if (updatedEnemy.velocityX < 0 && updatedEnemy.x > platform.x) {
              updatedEnemy.x = platform.x + platform.width
              updatedEnemy.velocityX *= -1
              updatedEnemy.direction = updatedEnemy.direction === 'left' ? 'right' : 'left'
            }
          }
        }
        
        // Check if enemy is approaching a platform edge (look ahead)
        if (onGround) {
          const lookAheadDistance = updatedEnemy.width
          const lookAheadX = updatedEnemy.velocityX > 0 ? 
            updatedEnemy.x + updatedEnemy.width + lookAheadDistance : 
            updatedEnemy.x - lookAheadDistance
          
          let foundPlatform = false
          for (const platform of newState.platforms) {
            if (checkCollision(
              { height: 1, width: 1, x: lookAheadX, y: updatedEnemy.y + updatedEnemy.height },
              platform
            ) && platform.solid) {
              foundPlatform = true
              break
            }
          }
          
          // Turn around at platform edges
          if (!foundPlatform) {
            updatedEnemy.velocityX *= -1
            updatedEnemy.direction = updatedEnemy.direction === 'left' ? 'right' : 'left'
          }
        }
        
        // Boundary checking
        if (updatedEnemy.x < 0) {
          updatedEnemy.x = 0
          updatedEnemy.velocityX *= -1
          updatedEnemy.direction = 'right'
        } else if (updatedEnemy.x > newState.levelWidth - updatedEnemy.width) {
          updatedEnemy.x = newState.levelWidth - updatedEnemy.width
          updatedEnemy.velocityX *= -1
          updatedEnemy.direction = 'left'
        }
        
        // Remove enemies that fall off the level
        if (updatedEnemy.y > newState.levelHeight) {
          updatedEnemy.alive = false
        }

        // Check collision with player
        if (checkCollision(player, updatedEnemy) && !player.invulnerable) {
          // Player stomps enemy
          if (player.velocityY > 0 && player.y < updatedEnemy.y) {
            updatedEnemy.alive = false
            player.velocityY = -JUMP_FORCE / 2 // Small bounce
            newState.score += 200
            
            // Add particle effect
            newState.particles.push({
              id: `particle-${Date.now()}`,
              life: 30,
              maxLife: 30,
              type: 'explosion',
              velocityX: (Math.random() - 0.5) * 4,
              velocityY: -2,
              x: updatedEnemy.x,
              y: updatedEnemy.y
            })
          } else {
            // Player gets hurt
            player.lives--
            player.invulnerable = true
            // eslint-disable-next-line sonarjs/no-nested-functions
            setTimeout(() => {
              setGameState(prev => ({
                ...prev,
                player: { ...prev.player, invulnerable: false }
              }))
            }, 2000)
            
            if (player.lives <= 0) {
              newState.gameStatus = 'gameOver'
            }
          }
        }

        return updatedEnemy
      }).filter(enemy => enemy.alive)

      // Update collectibles
      newState.collectibles = newState.collectibles.map(collectible => {
        if (collectible.collected) return collectible

        if (checkCollision(player, collectible)) {
          const updatedCollectible = { ...collectible, collected: true }
          newState.score += collectible.value
          
          // Add particle effect
          newState.particles.push({
            id: `coin-particle-${Date.now()}`,
            life: 20,
            maxLife: 20,
            type: 'coin',
            velocityX: 0,
            velocityY: -2,
            x: collectible.x,
            y: collectible.y
          })
          
          return updatedCollectible
        }

        return collectible
      })

      // Update particles
      newState.particles = newState.particles.map(particle => ({
        ...particle,
        life: particle.life - 1,
        x: particle.x + particle.velocityX,
        y: particle.y + particle.velocityY
      })).filter(particle => particle.life > 0)

      // Update game time
      newState.gameTime += 1/60 // Assuming 60 FPS

      newState.player = player
      return newState
    })
  }, [keyState])

  // Render the game
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#87CEEB' // Sky blue
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Translate for camera
    ctx.save()
    ctx.translate(-gameState.cameraX, 0)

    // Draw platforms
    gameState.platforms.forEach(platform => {
      switch (platform.type) {
        case 'brick':
          ctx.fillStyle = '#CD853F'
          break
        case 'cloud':
          ctx.fillStyle = '#F0F8FF'
          break
        case 'ground':
          ctx.fillStyle = '#8B4513'
          break
        case 'pipe':
          ctx.fillStyle = '#228B22'
          break
        default:
          ctx.fillStyle = '#808080'
      }
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height)
      
      // Add border for visibility
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 1
      ctx.strokeRect(platform.x, platform.y, platform.width, platform.height)
    })

    // Draw collectibles
    gameState.collectibles.forEach(collectible => {
      if (!collectible.collected) {
        switch (collectible.type) {
          case 'coin':
            ctx.fillStyle = '#FFD700'
            ctx.beginPath()
            ctx.arc(
              collectible.x + collectible.width / 2,
              collectible.y + collectible.height / 2,
              collectible.width / 2,
              0,
              2 * Math.PI
            )
            ctx.fill()
            break
          case 'mushroom':
            ctx.fillStyle = '#FF6B6B'
            ctx.fillRect(collectible.x, collectible.y, collectible.width, collectible.height)
            ctx.fillStyle = '#FFFFFF'
            ctx.fillRect(collectible.x + 4, collectible.y + 4, 4, 4)
            ctx.fillRect(collectible.x + 12, collectible.y + 4, 4, 4)
            break
        }
      }
    })

    // Draw enemies
    gameState.enemies.forEach(enemy => {
      if (enemy.alive) {
        switch (enemy.type) {
          case 'goomba': {
            // Body (with slight bounce animation)
            ctx.fillStyle = '#8B4513'
            const bounceOffset = Math.sin(gameState.gameTime * 10 + enemy.x * 0.1) * 1
            ctx.fillRect(enemy.x, enemy.y + bounceOffset, enemy.width, enemy.height)
            
            // Eyes
            ctx.fillStyle = '#000000'
            if (enemy.direction === 'left') {
              ctx.fillRect(enemy.x + 2, enemy.y + 4 + bounceOffset, 3, 3)
              ctx.fillRect(enemy.x + 12, enemy.y + 4 + bounceOffset, 3, 3)
            } else {
              ctx.fillRect(enemy.x + 9, enemy.y + 4 + bounceOffset, 3, 3)
              ctx.fillRect(enemy.x + 19, enemy.y + 4 + bounceOffset, 3, 3)
            }
            
            // Angry eyebrows
            ctx.fillStyle = '#000000'
            ctx.fillRect(enemy.x + 4, enemy.y + 2 + bounceOffset, 6, 2)
            ctx.fillRect(enemy.x + 14, enemy.y + 2 + bounceOffset, 6, 2)
            
            // Feet (simple animation based on position)
            ctx.fillStyle = '#654321'
            const footOffset = Math.floor(enemy.x / 10) % 2
            ctx.fillRect(enemy.x + 2 + footOffset, enemy.y + enemy.height - 2 + bounceOffset, 4, 2)
            ctx.fillRect(enemy.x + enemy.width - 6 + footOffset, enemy.y + enemy.height - 2 + bounceOffset, 4, 2)
            break
          }
            
          case 'koopa': {
            // Shell
            ctx.fillStyle = '#228B22'
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height)
            
            // Shell pattern
            ctx.fillStyle = '#FFFF00'
            ctx.fillRect(enemy.x + 4, enemy.y + 8, enemy.width - 8, 8)
            
            // Head (shows direction)
            ctx.fillStyle = '#90EE90'
            if (enemy.direction === 'left') {
              ctx.fillRect(enemy.x - 4, enemy.y + 4, 8, 12)
              // Eye
              ctx.fillStyle = '#000000'
              ctx.fillRect(enemy.x - 2, enemy.y + 6, 2, 2)
            } else {
              ctx.fillRect(enemy.x + enemy.width - 4, enemy.y + 4, 8, 12)
              // Eye
              ctx.fillStyle = '#000000'
              ctx.fillRect(enemy.x + enemy.width, enemy.y + 6, 2, 2)
            }
            
            // Legs (simple animation)
            ctx.fillStyle = '#90EE90'
            const legOffset = Math.floor(enemy.x / 8) % 2
            ctx.fillRect(enemy.x + 6 + legOffset, enemy.y + enemy.height - 4, 3, 4)
            ctx.fillRect(enemy.x + enemy.width - 9 + legOffset, enemy.y + enemy.height - 4, 3, 4)
            break
          }
        }
      }
    })

    // Draw player
    ctx.fillStyle = gameState.player.invulnerable ? '#FF69B4' : '#FF0000'
    ctx.fillRect(gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height)
    
    // Player details (simple Mario-like appearance)
    ctx.fillStyle = '#FFE4C4' // Skin color for face
    ctx.fillRect(gameState.player.x + 8, gameState.player.y + 8, 16, 16)
    
    // Hat
    ctx.fillStyle = '#FF0000'
    ctx.fillRect(gameState.player.x + 4, gameState.player.y + 4, 24, 8)
    
    // Mustache
    ctx.fillStyle = '#000000'
    ctx.fillRect(gameState.player.x + 12, gameState.player.y + 16, 8, 4)

    // Draw particles
    gameState.particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife
      ctx.globalAlpha = alpha
      
      switch (particle.type) {
        case 'coin':
          ctx.fillStyle = '#FFD700'
          ctx.font = '12px Arial'
          ctx.fillText('+' + (gameState.collectibles.find(c => c.type === 'coin')?.value || 100), particle.x, particle.y)
          break
        case 'explosion':
          ctx.fillStyle = '#FFA500'
          ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4)
          break
      }
      ctx.globalAlpha = 1
    })

    ctx.restore()

    // Draw UI
    ctx.fillStyle = '#000000'
    ctx.font = '20px Arial'
    ctx.fillText(`Score: ${gameState.score}`, 10, 30)
    ctx.fillText(`Lives: ${gameState.player.lives}`, 10, 55)
    ctx.fillText(`Level: ${gameState.level}`, 10, 80)

    // Game over screen
    if (gameState.gameStatus === 'gameOver') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '36px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20)
      ctx.font = '18px Arial'
      ctx.fillText(`Final Score: ${gameState.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20)
      ctx.fillText('Press R to restart or ESC to exit', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50)
      ctx.textAlign = 'left'
    }
  }, [gameState])

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      updateGame()
      render()
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [updateGame, render])

  // Keyboard event listeners
  useEffect(() => {
    const handleGameKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape') {
        onClose?.()
      } else if (event.code === 'KeyR' && gameState.gameStatus === 'gameOver') {
        setGameState(createInitialGameState())
      } else {
        handleKeyDown(event)
      }
    }

    window.addEventListener('keydown', handleGameKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleGameKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp, onClose, gameState.gameStatus])

  return (
    <div className="mario-game">
      <div className="mario-game-header">
        <h1>Super Mario Bros Clone</h1>
        <button 
          className="close-button"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
      
      <div className="mario-game-canvas-container">
        <canvas
          className="mario-game-canvas"
          height={CANVAS_HEIGHT}
          ref={canvasRef}
          width={CANVAS_WIDTH}
        />
      </div>
      
      <div className="mario-game-controls">
        <h3>Controls:</h3>
        <p>Arrow Keys / WASD: Move</p>
        <p>Space / Up Arrow: Jump</p>
        <p>Shift: Run</p>
        <p>ESC: Exit Game</p>
        <p>R: Restart (when game over)</p>
      </div>
    </div>
  )
}