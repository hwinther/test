import type { MarioGameResult, MarioGameState } from './mario-types'

import {
  MARIO_CANVAS_HEIGHT,
  MARIO_CANVAS_WIDTH,
  themeColors,
} from './mario-game-logic'

/**
 * Build the result payload emitted when a level is completed.
 * @param {import('./mario-types').MarioGameState} state - Final simulation state after the flag sequence
 * @returns {import('./mario-types').MarioGameResult} Summary statistics for parent UI or analytics
 */
export function buildMarioGameResult(state: MarioGameState): MarioGameResult {
  return {
    coinsCollected: state.coinsCollected,
    completed: true,
    enemiesDefeated: state.enemiesDefeated,
    level: state.level,
    score: state.score,
    timeElapsed: Math.floor(state.gameTime),
  }
}

/**
 * Draw the full game frame (world, entities, HUD, overlays) to a canvas.
 * @param {HTMLCanvasElement} canvas - Target element (2d context required)
 * @param {import('./mario-types').MarioGameState} state - Current simulation snapshot from the game ref
 * @returns {void}
 */
export function drawGame(canvas: HTMLCanvasElement, state: MarioGameState): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { ground, sky } = themeColors(state.levelTheme)
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, MARIO_CANVAS_WIDTH, MARIO_CANVAS_HEIGHT)

  ctx.save()
  ctx.translate(-state.cameraX, 0)

  state.platforms.forEach((platform) => {
    switch (platform.type) {
      case 'brick':
        ctx.fillStyle = '#CD853F'
        break
      case 'cloud':
        ctx.fillStyle = '#F0F8FF'
        break
      case 'ground':
        ctx.fillStyle = ground
        break
      case 'pipe':
        ctx.fillStyle = '#228B22'
        break
      default:
        ctx.fillStyle = '#808080'
    }
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height)
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 1
    ctx.strokeRect(platform.x, platform.y, platform.width, platform.height)
  })

  const flagPole = state.flagPole
  ctx.fillStyle = '#8B4513'
  ctx.fillRect(flagPole.x, flagPole.y, flagPole.width, flagPole.height)
  ctx.fillStyle = flagPole.reached ? '#32CD32' : '#FF0000'
  ctx.fillRect(flagPole.flag.x, flagPole.flag.y, flagPole.flag.width, flagPole.flag.height)
  ctx.fillStyle = '#FFD700'
  ctx.beginPath()
  ctx.arc(flagPole.x + flagPole.width / 2, flagPole.y, 8, 0, 2 * Math.PI)
  ctx.fill()

  state.collectibles.forEach((collectible) => {
    if (collectible.collected) return
    switch (collectible.type) {
      case 'coin':
        ctx.fillStyle = '#FFD700'
        ctx.beginPath()
        ctx.arc(
          collectible.x + collectible.width / 2,
          collectible.y + collectible.height / 2,
          collectible.width / 2,
          0,
          2 * Math.PI,
        )
        ctx.fill()
        break
      case 'fireflower':
        ctx.fillStyle = '#FF4500'
        ctx.fillRect(collectible.x, collectible.y, collectible.width, collectible.height)
        ctx.fillStyle = '#FFD700'
        ctx.fillRect(collectible.x + 6, collectible.y + 4, 12, 8)
        ctx.fillStyle = '#FFFFFF'
        ctx.beginPath()
        ctx.arc(collectible.x + collectible.width / 2, collectible.y + 6, 4, 0, 2 * Math.PI)
        ctx.fill()
        break
      case 'mushroom':
        ctx.fillStyle = '#FF6B6B'
        ctx.fillRect(collectible.x, collectible.y, collectible.width, collectible.height)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(collectible.x + 4, collectible.y + 4, 4, 4)
        ctx.fillRect(collectible.x + 12, collectible.y + 4, 4, 4)
        break
      case 'star':
        ctx.fillStyle = '#FFD700'
        ctx.beginPath()
        ctx.moveTo(collectible.x + collectible.width / 2, collectible.y)
        ctx.lineTo(collectible.x + collectible.width, collectible.y + collectible.height * 0.4)
        ctx.lineTo(collectible.x + collectible.width * 0.65, collectible.y + collectible.height)
        ctx.lineTo(collectible.x + collectible.width * 0.35, collectible.y + collectible.height)
        ctx.lineTo(collectible.x, collectible.y + collectible.height * 0.4)
        ctx.closePath()
        ctx.fill()
        break
      default:
        break
    }
  })

  state.fireballs.forEach((fb) => {
    ctx.fillStyle = '#FF6600'
    ctx.beginPath()
    ctx.arc(fb.x + fb.width / 2, fb.y + fb.height / 2, fb.width / 2, 0, 2 * Math.PI)
    ctx.fill()
    ctx.fillStyle = '#FFEE44'
    ctx.beginPath()
    ctx.arc(fb.x + fb.width / 2 - 1, fb.y + fb.height / 2 - 1, fb.width / 4, 0, 2 * Math.PI)
    ctx.fill()
  })

  state.enemies.forEach((enemy) => {
    if (!enemy.alive) return
    switch (enemy.type) {
      case 'goomba': {
        ctx.fillStyle = '#8B4513'
        const bounceOffset = Math.sin(state.gameTime * 10 + enemy.x * 0.1) * 1
        ctx.fillRect(enemy.x, enemy.y + bounceOffset, enemy.width, enemy.height)
        ctx.fillStyle = '#000000'
        if (enemy.direction === 'left') {
          ctx.fillRect(enemy.x + 2, enemy.y + 4 + bounceOffset, 3, 3)
          ctx.fillRect(enemy.x + 12, enemy.y + 4 + bounceOffset, 3, 3)
        } else {
          ctx.fillRect(enemy.x + 9, enemy.y + 4 + bounceOffset, 3, 3)
          ctx.fillRect(enemy.x + 19, enemy.y + 4 + bounceOffset, 3, 3)
        }
        ctx.fillRect(enemy.x + 4, enemy.y + 2 + bounceOffset, 6, 2)
        ctx.fillRect(enemy.x + 14, enemy.y + 2 + bounceOffset, 6, 2)
        ctx.fillStyle = '#654321'
        const footOffset = Math.floor(enemy.x / 10) % 2
        ctx.fillRect(enemy.x + 2 + footOffset, enemy.y + enemy.height - 2 + bounceOffset, 4, 2)
        ctx.fillRect(enemy.x + enemy.width - 6 + footOffset, enemy.y + enemy.height - 2 + bounceOffset, 4, 2)
        break
      }
      case 'koopa': {
        ctx.fillStyle = '#228B22'
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height)
        ctx.fillStyle = '#FFFF00'
        ctx.fillRect(enemy.x + 4, enemy.y + 8, enemy.width - 8, 8)
        ctx.fillStyle = '#90EE90'
        if (enemy.direction === 'left') {
          ctx.fillRect(enemy.x - 4, enemy.y + 4, 8, 12)
          ctx.fillStyle = '#000000'
          ctx.fillRect(enemy.x - 2, enemy.y + 6, 2, 2)
        } else {
          ctx.fillRect(enemy.x + enemy.width - 4, enemy.y + 4, 8, 12)
          ctx.fillStyle = '#000000'
          ctx.fillRect(enemy.x + enemy.width, enemy.y + 6, 2, 2)
        }
        ctx.fillStyle = '#90EE90'
        const legOffset = Math.floor(enemy.x / 8) % 2
        ctx.fillRect(enemy.x + 6 + legOffset, enemy.y + enemy.height - 4, 3, 4)
        ctx.fillRect(enemy.x + enemy.width - 9 + legOffset, enemy.y + enemy.height - 4, 3, 4)
        break
      }
      case 'piranha': {
        ctx.fillStyle = '#228B22'
        ctx.fillRect(enemy.x + 4, enemy.y + 8, enemy.width - 8, enemy.height - 8)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(enemy.x + 6, enemy.y + 12, 5, 5)
        ctx.fillRect(enemy.x + enemy.width - 11, enemy.y + 12, 5, 5)
        ctx.fillStyle = '#000000'
        ctx.fillRect(enemy.x + 8, enemy.y + 14, 2, 2)
        ctx.fillRect(enemy.x + enemy.width - 10, enemy.y + 14, 2, 2)
        ctx.fillStyle = '#8B0000'
        ctx.beginPath()
        ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height)
        ctx.lineTo(enemy.x + 4, enemy.y + 20)
        ctx.lineTo(enemy.x + enemy.width - 4, enemy.y + 20)
        ctx.fill()
        break
      }
      default:
        break
    }
  })

  const pl = state.player
  const starGlow = performance.now() < state.starPowerUntil
  let bodyColor = '#FF0000'
  if (starGlow) {
    bodyColor = '#FFD700'
  } else if (pl.invulnerable) {
    bodyColor = '#FF69B4'
  }
  ctx.fillStyle = bodyColor
  ctx.fillRect(pl.x, pl.y, pl.width, pl.height)

  const faceScale = pl.height > 36 ? 1.15 : 1
  const faceSize = Math.min(16 * faceScale, pl.width - 8)
  const faceX = pl.x + (pl.width - faceSize) / 2
  const faceY = pl.y + 8
  ctx.fillStyle = '#FFE4C4'
  ctx.fillRect(faceX, faceY, faceSize, faceSize)
  ctx.fillStyle = '#FF0000'
  ctx.fillRect(pl.x + 4, pl.y + 4, pl.width - 8, 8)
  ctx.fillStyle = '#000000'
  ctx.fillRect(pl.x + pl.width / 2 - 4, pl.y + 12 + (faceSize - 16) * 0.2, 8, 4)

  state.particles.forEach((particle) => {
    const alpha = particle.life / particle.maxLife
    ctx.globalAlpha = alpha
    switch (particle.type) {
      case 'brick':
        ctx.fillStyle = '#DEB887'
        ctx.fillRect(particle.x - 2, particle.y - 2, 5, 4)
        break
      case 'coin':
        ctx.fillStyle = '#FFD700'
        ctx.font = '12px Arial'
        if (Math.abs(particle.x - state.flagPole.x) < 50) {
          const flagPoleHeight = state.flagPole.height
          const playerHeightOnPole = state.flagPole.y + flagPoleHeight - particle.y
          const heightRatio = Math.max(0, Math.min(1, playerHeightOnPole / flagPoleHeight))
          const flagScore = Math.floor(100 + heightRatio * 4900)
          ctx.fillText(`+${flagScore}`, particle.x, particle.y)
        } else {
          ctx.fillText(
            '+' + (state.collectibles.find((c) => c.type === 'coin')?.value || 100),
            particle.x,
            particle.y,
          )
        }
        break
      case 'explosion':
        ctx.fillStyle = '#FFA500'
        ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4)
        break
      default:
        break
    }
    ctx.globalAlpha = 1
  })

  ctx.restore()

  ctx.fillStyle = '#000000'
  ctx.font = '20px Arial'
  ctx.textAlign = 'left'
  ctx.fillText(`Score: ${state.score}`, 10, 30)
  ctx.fillText(`Lives: ${state.player.lives}`, 10, 55)
  ctx.fillText(`Level: ${state.level}`, 10, 80)
  if (state.timeRemaining !== null) {
    ctx.fillText(`Time: ${Math.ceil(state.timeRemaining)}`, 10, 105)
  }
  const fireHintY = state.timeRemaining === null ? 105 : 130
  if (state.player.powerUp === 'fire') {
    ctx.fillText('Fire — Z: fireball', 10, fireHintY)
  }

  if (state.gameStatus === 'gameOver') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(0, 0, MARIO_CANVAS_WIDTH, MARIO_CANVAS_HEIGHT)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '36px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('GAME OVER', MARIO_CANVAS_WIDTH / 2, MARIO_CANVAS_HEIGHT / 2 - 20)
    ctx.font = '18px Arial'
    ctx.fillText(`Final Score: ${state.score}`, MARIO_CANVAS_WIDTH / 2, MARIO_CANVAS_HEIGHT / 2 + 20)
    ctx.fillText('Press R to restart or ESC to exit', MARIO_CANVAS_WIDTH / 2, MARIO_CANVAS_HEIGHT / 2 + 50)
    ctx.textAlign = 'left'
  }

  if (state.gameStatus === 'complete') {
    ctx.fillStyle = 'rgba(0, 100, 0, 0.8)'
    ctx.fillRect(0, 0, MARIO_CANVAS_WIDTH, MARIO_CANVAS_HEIGHT)
    ctx.fillStyle = '#FFFF00'
    ctx.font = '36px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('LEVEL COMPLETE!', MARIO_CANVAS_WIDTH / 2, MARIO_CANVAS_HEIGHT / 2 - 60)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '24px Arial'
    ctx.fillText('Flag Captured!', MARIO_CANVAS_WIDTH / 2, MARIO_CANVAS_HEIGHT / 2 - 20)
    ctx.font = '18px Arial'
    ctx.fillText(`Final Score: ${state.score}`, MARIO_CANVAS_WIDTH / 2, MARIO_CANVAS_HEIGHT / 2 + 20)
    ctx.fillText(`Time: ${Math.floor(state.gameTime)}s`, MARIO_CANVAS_WIDTH / 2, MARIO_CANVAS_HEIGHT / 2 + 50)
    ctx.fillText('Press R to restart or ESC to exit', MARIO_CANVAS_WIDTH / 2, MARIO_CANVAS_HEIGHT / 2 + 80)
    ctx.textAlign = 'left'
  }

  if (state.gameStatus === 'paused') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
    ctx.fillRect(0, 0, MARIO_CANVAS_WIDTH, MARIO_CANVAS_HEIGHT)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '32px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('PAUSED', MARIO_CANVAS_WIDTH / 2, MARIO_CANVAS_HEIGHT / 2)
    ctx.font = '16px Arial'
    ctx.fillText('Press P to resume', MARIO_CANVAS_WIDTH / 2, MARIO_CANVAS_HEIGHT / 2 + 36)
    ctx.textAlign = 'left'
  }
}
