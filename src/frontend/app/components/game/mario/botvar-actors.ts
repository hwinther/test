import type { Collectible, Fireball, MarioGameState } from './mario-types'

const INK = '#262033'
const PAPER = '#fff0c6'
const POST_PURPLE = '#985fac'
const STAMP_RED = '#f58a91'
const APPROVED = '#7bdab2'
const GOAL_ACTION = ['Lever inn', 'Godkjenn', 'Publiser']
const WORKFLOW_GOAL_ACTION = ['Lever forslaget', 'Vis foreløpig', 'Publiser endelig']
const WORKFLOW_GOAL_STATUS = ['Innlevert', 'Synlig på nett', 'Sak opprettet']

export const BOTVAR_GOAL_STATUS = ['Innlevert', 'Godkjent', 'Publisert']

interface PaperBounds {
  height: number
  width: number
}

/**
 * Render a file, authorization pass, or stamp with a shared outline.
 * @param {CanvasRenderingContext2D} ctx - Canvas drawing context
 * @param {PaperBounds} item - Current pickup or projectile bounds
 * @param {string} color - Item body color
 */
function drawPaper(ctx: CanvasRenderingContext2D, item: PaperBounds, color: string): void {
  const { height, width } = item
  ctx.fillStyle = INK
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = color
  ctx.fillRect(1, 1, width - 2, height - 2)
  ctx.fillStyle = PAPER
  ctx.fillRect(2, 2, width - 4, 2)
  ctx.fillStyle = INK
  ctx.fillRect(3, Math.floor(height / 2), width - 6, 1)
  ctx.fillRect(3, Math.floor(height / 2) + 3, width - 8, 1)
}

/**
 * Render an animated pickup within its collision bounds.
 * @param {CanvasRenderingContext2D} ctx - Canvas drawing context
 * @param {Collectible} item - Item to render
 * @param {number} time - Elapsed simulation seconds
 */
export function drawBotvarCollectible(ctx: CanvasRenderingContext2D, item: Collectible, time: number): void {
  const { height, type, width, x, y } = item
  const bob = Math.round(Math.sin(time * 6 + x * 0.04) * 2)
  ctx.save()
  ctx.translate(x + 2, y + 2 + bob)
  if (type === 'star') {
    ctx.fillStyle = INK
    ctx.fillRect(0, 3, width - 4, height - 10)
    ctx.fillRect(3, 0, width - 10, height - 4)
    ctx.fillStyle = '#ffd987'
    ctx.fillRect(2, 5, width - 8, height - 14)
    ctx.fillRect(5, 2, width - 14, height - 8)
    ctx.fillStyle = PAPER
    ctx.fillRect(width / 2 - 3, height / 2 - 3, 2, 2)
  } else {
    const color = { coin: '#ebca88', fireflower: STAMP_RED, mushroom: '#a6dbdb' }[type]
    drawPaper(ctx, { height: height - 4, width: width - 4 }, color)
  }
  ctx.restore()
}

/**
 * Render the red stamp projectile and its motion trail.
 * @param {CanvasRenderingContext2D} ctx - Canvas drawing context
 * @param {Fireball} projectile - Shot launched by powered-up Botvar
 */
export function drawBotvarProjectile(ctx: CanvasRenderingContext2D, projectile: Fireball): void {
  const { velocityX, x, y } = projectile
  ctx.fillStyle = '#a65878'
  ctx.fillRect(x - Math.sign(velocityX) * 5, y + 4, 10, 3)
  ctx.save()
  ctx.translate(Math.round(x), Math.round(y))
  drawPaper(ctx, projectile, STAMP_RED)
  ctx.restore()
}

/**
 * Render Botvar using the mascot art with independently animated legs.
 * @param {CanvasRenderingContext2D} ctx - Canvas drawing context
 * @param {MarioGameState} state - Current game state
 * @param {HTMLImageElement | null} sprite - Loaded Botvar mascot art
 */
export function drawBotvarPlayer(
  ctx: CanvasRenderingContext2D,
  state: MarioGameState,
  sprite: HTMLImageElement | null,
): void {
  const { gameTime, player } = state
  const { height, velocityX, width } = player
  const direction = player.facing === 'right' ? 1 : -1
  const speed = Math.abs(velocityX)
  const airborne = !player.onGround
  const moving = speed > 0.25
  const braking = moving && !airborne && Math.sign(velocityX) !== direction
  const cadence = player.isRunning ? 29 : 19
  const stride = moving && !braking ? Math.sin(gameTime * cadence) : 0
  const hop = airborne ? -2 : Math.round(Math.abs(stride) * -2)
  const lean = braking ? -2 : Math.round(stride)
  const star = gameTime * 1000 < state.starPowerUntil
  const x = Math.round(player.x)
  const y = Math.round(player.y)

  if (braking) {
    ctx.fillStyle = '#dbc9a9'
    ctx.fillRect(x + width / 2 - direction * 14, y + height - 4, 4, 2)
    ctx.fillRect(x + width / 2 - direction * 18, y + height - 7, 2, 2)
  }

  ctx.save()
  ctx.translate(x + (direction < 0 ? width : 0), y)
  ctx.scale(direction, 1)
  if (star || player.invulnerable) ctx.globalAlpha = 0.55 + 0.45 * Math.abs(Math.sin(gameTime * 27))

  const bodyHeight = height - 6
  if (sprite) {
    ctx.drawImage(sprite, 0, 0, 36, 42, lean, hop, width, bodyHeight)
  } else {
    ctx.fillStyle = '#a89eaf'
    ctx.fillRect(4 + lean, 7 + hop, width - 8, bodyHeight - 7)
    ctx.fillStyle = PAPER
    ctx.fillRect(5 + lean, 10 + hop, width - 10, 7)
    ctx.fillStyle = INK
    ctx.fillRect(9 + lean, 11 + hop, 2, 4)
    ctx.fillRect(width - 10 + lean, 11 + hop, 2, 4)
  }

  const rearX = Math.round(width * 0.3 + stride * 4) - (airborne || braking ? 2 : 0)
  const frontX = Math.round(width * 0.63 - stride * 4) + (airborne || braking ? 2 : 0)
  const rearY = height - 6 - (airborne ? 2 : Math.max(0, Math.round(stride * 4)))
  const frontY = height - 6 - (airborne ? 4 : Math.max(0, Math.round(stride * -4)))
  ctx.fillStyle = '#685674'
  ctx.fillRect(rearX, rearY - 2, 3, 7)
  ctx.fillRect(frontX, frontY - 2, 3, 7)
  ctx.fillStyle = player.powerUp === 'fire' ? STAMP_RED : '#d8a2c3'
  ctx.fillRect(rearX, rearY + 4, 5, 2)
  ctx.fillRect(frontX, frontY + 4, 5, 2)

  if (player.powerUp === 'fire' || state.flagPole.reached) {
    ctx.fillStyle = state.flagPole.reached ? APPROVED : STAMP_RED
    ctx.fillRect(width - 8, Math.round(height * 0.48) + hop, 8, 7)
    ctx.fillStyle = PAPER
    ctx.fillRect(width - 6, Math.round(height * 0.48) + hop + 2, 4, 1)
  }
  ctx.restore()
}

/**
 * Render the docket terminal at the existing goal collision bounds.
 * @param {CanvasRenderingContext2D} ctx - Canvas drawing context
 * @param {MarioGameState} state - Current game state
 * @param {boolean} workflow - Whether the campaign workflow is active
 */
export function drawBotvarGoal(ctx: CanvasRenderingContext2D, state: MarioGameState, workflow = false): void {
  const { gameTime, flagPole: pole } = state
  const remaining = (state.pendingCompleteAt ?? 0) - gameTime * 1000
  const progress = Math.max(0, Math.min(1, 1 - remaining / 500))
  const panelWidth = workflow ? 102 : 66
  const panelX = workflow ? pole.x - 73 : pole.x - 28
  const panelY = pole.y + 27
  const statusColor = pole.reached ? APPROVED : '#ffe09d'
  ctx.fillStyle = INK
  ctx.fillRect(pole.x, pole.y, pole.width, pole.height)
  ctx.fillStyle = '#80708d'
  ctx.fillRect(pole.x + 2, pole.y, 3, pole.height)
  ctx.fillStyle = statusColor
  ctx.fillRect(pole.x + 2, pole.y + 3, 5, 5)

  ctx.fillStyle = INK
  ctx.fillRect(panelX - 3, panelY - 3, panelWidth + 6, 33)
  ctx.fillStyle = pole.reached ? '#2e655e' : '#665075'
  ctx.fillRect(panelX, panelY, panelWidth, 27)
  ctx.fillStyle = statusColor
  ctx.fillRect(panelX + 2, panelY + 2, panelWidth - 4, 2)
  ctx.font = 'bold 9px monospace'
  ctx.textAlign = 'center'
  const stageIndex = state.level - 1
  const action = workflow ? WORKFLOW_GOAL_ACTION : GOAL_ACTION
  const status = workflow ? WORKFLOW_GOAL_STATUS : BOTVAR_GOAL_STATUS
  const labels = pole.reached ? status : action
  ctx.fillText(labels[stageIndex] ?? labels[0], panelX + panelWidth / 2, panelY + 17)
  ctx.textAlign = 'left'
  const led = Math.floor(gameTime * 5) % 2 === 0
  ctx.fillStyle = pole.reached || led ? statusColor : POST_PURPLE
  ctx.fillRect(panelX + panelWidth / 2 - 3, panelY + 22, 6, 2)

  if (pole.reached && progress < 1) {
    const submittedY = state.player.y + state.player.height / 2
    const destinationY = panelY + 22
    const arrival = 1 - (1 - progress) ** 2
    const envelopeY = Math.round(submittedY + (destinationY - submittedY) * arrival)
    ctx.save()
    ctx.translate(pole.x - 3, envelopeY)
    drawPaper(ctx, { height: 12, width: 14 }, APPROVED)
    ctx.restore()
  }
}

/**
 * Draw the pixel portrait of a stationary person in the workflow.
 * @param {CanvasRenderingContext2D} ctx - Canvas drawing context
 * @param {number} x - Left edge of the portrait
 * @param {number} y - Top edge of the portrait
 * @param {string} jacket - Role's jacket color
 * @param {string} skin - Face color
 * @param {string} hair - Hair color
 */
export function drawBotvarColleague(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  jacket: string,
  skin: string,
  hair: string,
): void {
  ctx.fillStyle = INK
  ctx.fillRect(x + 3, y, 18, 20)
  ctx.fillRect(x, y + 20, 24, 21)
  ctx.fillStyle = skin
  ctx.fillRect(x + 5, y + 4, 14, 14)
  ctx.fillStyle = hair
  ctx.fillRect(x + 4, y + 1, 16, 7)
  ctx.fillRect(x + 4, y + 7, 3, 6)
  ctx.fillStyle = INK
  ctx.fillRect(x + 9, y + 10, 2, 2)
  ctx.fillRect(x + 15, y + 10, 2, 2)
  ctx.fillStyle = jacket
  ctx.fillRect(x + 2, y + 21, 20, 16)
  ctx.fillStyle = PAPER
  ctx.fillRect(x + 10, y + 21, 4, 7)
  ctx.fillRect(x + 16, y + 25, 4, 2)
}
