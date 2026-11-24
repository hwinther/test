import type { MarioGameState, Platform } from './mario-types'

import { drawBotvarPlayer } from './botvar-actors'

const WIDTH = 800
const HEIGHT = 400
const FLOOR_Y = 350
// cspell:ignore beskirver vedllegget -- deliberate proofreading exercises
const LINES = [
  { corrected: 'Forslaget beskriver tiltaket.', draft: 'Forslaget beskirver tiltaket.', width: 156, x: 152, y: 280 },
  { corrected: 'Vedlegget følger saken.', draft: 'Vedllegget følger saken.', width: 162, x: 352, y: 184 },
]

/**
 * Open the proofreading room at the start of the final Botvar course.
 * @param {MarioGameState} state - Initial state of the publication course
 * @returns {MarioGameState} Playable proofreading room with the course saved for reentry
 */
export function startBotvarProofroom(state: MarioGameState): MarioGameState {
  const floor: Platform = {
    breakable: false,
    height: HEIGHT - FLOOR_Y,
    id: 'proof-floor',
    solid: true,
    type: 'ground',
    width: WIDTH,
    x: 0,
    y: FLOOR_Y,
  }
  const spawnPosition = { x: 52, y: FLOOR_Y - state.player.height }

  return {
    ...state,
    collectibles: [],
    enemies: [],
    furthestX: spawnPosition.x,
    levelHeight: HEIGHT,
    levelWidth: WIDTH,
    platforms: [
      floor,
      ...LINES.map(({ width, x, y }, index): Platform => ({
        breakable: false,
        height: 16,
        id: `proof-line-${index}`,
        solid: true,
        type: 'cloud',
        width,
        x,
        y,
      })),
    ],
    player: { ...state.player, ...spawnPosition, onGround: true },
    proofroom: {
      course: {
        collectibles: state.collectibles,
        enemies: state.enemies,
        levelHeight: state.levelHeight,
        levelWidth: state.levelWidth,
        platforms: state.platforms,
        spawnPosition: state.spawnPosition,
      },
      exit: { height: 70, width: 110, x: 656, y: FLOOR_Y - 70 },
      marks: LINES.map(({ x, y }) => ({
        collected: false,
        height: 24,
        width: 22,
        x: x + 90,
        y: y - 28,
      })),
    },
    spawnPosition,
  }
}

/**
 * Draw the document, its text-line platforms, correction marks and approval exit.
 * @param {CanvasRenderingContext2D} ctx - Canvas drawing context
 * @param {MarioGameState} state - State containing the proofreading room
 * @param {HTMLImageElement | null} sprite - Loaded Botvar mascot art
 */
export function drawBotvarProofroom(
  ctx: CanvasRenderingContext2D,
  state: MarioGameState,
  sprite: HTMLImageElement | null,
): void {
  const room = state.proofroom
  if (!room) return

  const corrected = room.marks.filter(({ collected }) => collected).length
  const ready = corrected === room.marks.length

  ctx.fillStyle = '#26243a'
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
  ctx.fillStyle = '#141320'
  ctx.fillRect(28, 24, 752, 350)
  ctx.fillStyle = '#fbf0d9'
  ctx.fillRect(20, 16, 752, 350)
  ctx.fillStyle = '#e3cba7'
  ctx.fillRect(42, 109, 2, FLOOR_Y - 109)
  ctx.fillRect(20, FLOOR_Y, 752, 16)

  ctx.fillStyle = '#393054'
  ctx.font = 'bold 28px system-ui, sans-serif'
  ctx.fillText('Korrektur', 48, 57)
  ctx.font = '15px system-ui, sans-serif'
  ctx.fillText('Hopp opp på tekstlinjene og samle begge rettelsene.', 48, 88)
  ctx.font = 'bold 16px system-ui, sans-serif'
  ctx.fillText(`Rettelser ${corrected}/${room.marks.length}`, 626, 56)

  LINES.forEach(({ corrected: revisedText, draft, width, x, y }, index) => {
    const { collected } = room.marks[index]
    ctx.fillStyle = collected ? '#b5dec1' : '#f0bbad'
    ctx.fillRect(x, y, width, 16)
    ctx.fillStyle = '#432e46'
    ctx.font = '11px system-ui, sans-serif'
    ctx.fillText(collected ? revisedText : draft, x + 7, y + 12)
  })

  room.marks.forEach(({ collected, x, y }) => {
    if (collected) return
    ctx.fillStyle = '#ad343f'
    ctx.fillRect(x, y, 22, 22)
    ctx.strokeStyle = '#fff5e6'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x + 5, y + 11)
    ctx.lineTo(x + 9, y + 15)
    ctx.lineTo(x + 17, y + 7)
    ctx.stroke()
  })

  const { height, width, x, y } = room.exit
  ctx.fillStyle = ready ? '#225849' : '#675973'
  ctx.fillRect(x, y, width - 6, height)
  ctx.strokeStyle = ready ? '#8ce2b3' : '#b3a3bf'
  ctx.lineWidth = 2
  ctx.strokeRect(x + 4, y + 4, width - 14, height - 8)
  ctx.fillStyle = '#fbf0d9'
  ctx.font = 'bold 12px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(ready ? 'Send til' : 'Mangler', x + 52, y + 29)
  ctx.fillText(ready ? 'godkjenning' : 'rettelser', x + 52, y + 47)
  ctx.textAlign = 'start'

  drawBotvarPlayer(ctx, state, sprite)
}
