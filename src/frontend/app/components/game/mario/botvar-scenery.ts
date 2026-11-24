import type { MarioGameState, Platform } from './mario-types'

import { drawBotvarColleague } from './botvar-actors'
import { BOTVAR_STAGE_TITLES, getBotvarMilestone, getBotvarStations, getBotvarStationX } from './botvar-workflow'

const ROOM_COLORS = [
  { ceiling: '#29263e', wall: '#34314a', trim: '#4b4862', sky: '#575271', building: '#45435f', light: '#aa8193' },
  { ceiling: '#61556a', wall: '#a08d94', trim: '#b39aa0', sky: '#cfb9a9', building: '#aa979e', light: '#ead4b7' },
  { ceiling: '#202c3b', wall: '#2b4050', trim: '#3c5666', sky: '#506d7c', building: '#405e6d', light: '#d1a988' },
]

type RoomColors = (typeof ROOM_COLORS)[number]

const PLATFORM_COLORS = {
  brick: { top: '#e9b385', front: '#ae695b', dark: '#683e4a', detail: '#f7d4a9' },
  cloud: { top: '#a7e2d7', front: '#477f87', dark: '#294d65', detail: '#669faa' },
  ground: { top: '#ebc689', front: '#655169', dark: '#352c45', detail: '#927b8c' },
  pipe: { top: '#ef99ae', front: '#ad607b', dark: '#643d60', detail: '#d982a0' },
}

const STAGE_TITLE = ['Innlevering', 'Kvalitetssikring', 'Publisering']

/**
 * Draw the recessed windows and city behind the office furniture.
 * @param {CanvasRenderingContext2D} ctx - Canvas drawing context
 * @param {MarioGameState} state - Current game state
 * @param {number} width - Viewport width
 * @param {number} height - Viewport height
 * @param {boolean} workflow - Whether the campaign workflow is active
 */
export function drawBotvarBackground(
  ctx: CanvasRenderingContext2D,
  state: MarioGameState,
  width: number,
  height: number,
  workflow = false,
): void {
  const colors = ROOM_COLORS[Math.min(state.level - 1, ROOM_COLORS.length - 1)] ?? ROOM_COLORS[0]
  ctx.fillStyle = colors.wall
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = colors.ceiling
  ctx.fillRect(0, 0, width, 58)
  ctx.fillRect(0, height - 15, width, 15)
  ctx.fillStyle = colors.trim
  ctx.fillRect(0, 56, width, 3)
  ctx.fillRect(0, 278, width, 4)

  const cityScroll = Math.floor(state.cameraX * 0.12)
  const roomScroll = Math.floor(state.cameraX * 0.37)
  const bayWidth = 206
  for (let x = 24 - (roomScroll % bayWidth); x < width; x += bayWidth) {
    ctx.fillStyle = colors.ceiling
    ctx.fillRect(x - 4, 68, 180, 174)
    ctx.fillStyle = colors.trim
    ctx.fillRect(x, 72, 172, 162)
    ctx.fillStyle = colors.sky
    ctx.fillRect(x + 4, 76, 164, 152)
    ctx.save()
    ctx.beginPath()
    ctx.rect(x + 4, 76, 164, 152)
    ctx.clip()
    drawCity(ctx, colors, cityScroll, x, 233)
    ctx.restore()

    ctx.fillStyle = colors.ceiling
    ctx.fillRect(x + 55, 76, 3, 153)
    ctx.fillRect(x + 113, 76, 3, 153)
    ctx.fillRect(x + 4, 119, 164, 3)
    ctx.fillStyle = colors.trim
    ctx.fillRect(x - 6, 234, 184, 5)
    ctx.fillRect(x + 184, 59, 4, 217)
    ctx.fillRect(x + 24, 254, 123, 2)
    ctx.fillRect(x + 24, 262, 123, 2)
    drawOfficeDetails(ctx, workflow && state.level === 2 ? 3 : state.level, x, colors)
  }

  ctx.fillStyle = colors.ceiling
  ctx.fillRect(0, 322, width, height - 322)
  ctx.fillStyle = colors.trim
  for (let x = -Math.floor(state.cameraX * 0.6) % 80; x < width; x += 80) {
    ctx.fillRect(x, 324, 2, height - 324)
    ctx.fillRect(x + 17, 337, 24, 2)
  }
}

/**
 * Give each room its own office fittings in the recessed scenery layer.
 * @param {CanvasRenderingContext2D} ctx - Canvas drawing context
 * @param {number} stage - Campaign stage number
 * @param {number} x - Left side of the window bay
 * @param {RoomColors} colors - Current room palette
 */
function drawOfficeDetails(ctx: CanvasRenderingContext2D, stage: number, x: number, colors: RoomColors): void {
  switch (stage) {
    case 2:
      // Oversized proof sheets behind the playable rows of shelves.
      ctx.fillStyle = '#776878'
      ctx.fillRect(x + 50, 106, 78, 108)
      ctx.fillStyle = '#e4ceb3'
      ctx.fillRect(x + 44, 101, 78, 108)
      ctx.fillStyle = '#b19ba1'
      ctx.fillRect(x + 54, 113, 37, 5)
      for (let y = 131; y <= 190; y += 8) {
        ctx.fillRect(x + 54, y, 58 - (y % 5) * 5, 2)
      }
      ctx.fillStyle = '#b07383'
      ctx.fillRect(x + 56, 163, 30, 2)
      ctx.fillRect(x + 98, 141, 8, 2)
      ctx.fillRect(x + 106, 136, 2, 7)
      break
    case 3:
      // Wood panelling and bench backs in the chamber.
      ctx.fillStyle = '#324452'
      ctx.fillRect(x + 12, 221, 150, 50)
      ctx.fillStyle = '#536273'
      ctx.fillRect(x + 12, 221, 150, 3)
      for (let seat = x + 24; seat < x + 150; seat += 24) {
        ctx.fillRect(seat, 231, 15, 28)
      }
      ctx.fillStyle = '#716269'
      ctx.fillRect(x + 16, 263, 142, 4)
      break
    default:
      // Bundles of incoming files on the back counter.
      ctx.fillStyle = colors.trim
      ctx.fillRect(x + 38, 308, 102, 11)
      ctx.fillStyle = '#755e75'
      ctx.fillRect(x + 44, 297, 35, 11)
      ctx.fillRect(x + 84, 292, 42, 16)
      ctx.fillStyle = '#a28591'
      ctx.fillRect(x + 47, 299, 28, 2)
      ctx.fillRect(x + 88, 295, 33, 2)
      ctx.fillRect(x + 88, 301, 22, 2)
      break
  }
}

/**
 * Draw the distant skyline with its own scroll rate.
 * @param {CanvasRenderingContext2D} ctx - Canvas drawing context
 * @param {RoomColors} colors - Current room palette
 * @param {number} scroll - Distant layer offset
 * @param {number} left - Start of the visible window
 * @param {number} base - Bottom of the buildings
 */
function drawCity(ctx: CanvasRenderingContext2D, colors: RoomColors, scroll: number, left: number, base: number): void {
  const firstBuilding = Math.floor((scroll + left) / 37)
  for (let building = firstBuilding; building <= firstBuilding + 5; building++) {
    const x = building * 37 - scroll
    const height = 28 + Math.abs((building * 19) % 49)
    ctx.fillStyle = colors.building
    ctx.fillRect(x, base - height, 34, height)
    ctx.fillRect(x + 10, base - height - 4, 14, 4)
    ctx.fillStyle = colors.light
    for (let y = base - height + 9; y < base - 8; y += 12) {
      ctx.fillRect(x + 7, y, 4, 2)
      ctx.fillRect(x + 22, y, 4, 2)
    }
  }
}

/**
 * Draw collision-aligned flooring, file boxes, shelves, or cabinets.
 * @param {CanvasRenderingContext2D} ctx - Canvas drawing context
 * @param {Platform} platform - Platform whose top defines the landing surface
 */
export function drawBotvarPlatform(ctx: CanvasRenderingContext2D, platform: Platform): void {
  const { height, type, width, x, y } = platform
  const colors = PLATFORM_COLORS[type]
  ctx.fillStyle = colors.dark
  ctx.fillRect(x, y, width, height)
  ctx.fillStyle = colors.front
  ctx.fillRect(x + 1, y + 3, width - 2, height - 6)
  ctx.fillStyle = colors.top
  ctx.fillRect(x, y, width, 3)
  ctx.fillStyle = colors.detail
  ctx.fillRect(x + 2, y, width - 4, 1)

  switch (type) {
    case 'ground':
      ctx.fillStyle = colors.detail
      ctx.fillRect(x, y + 7, width, 1)
      ctx.fillRect(x + 6, y + 18, 14, 2)
      break
    case 'brick':
      ctx.fillRect(x + 6, y + 10, width - 12, 6)
      ctx.fillStyle = colors.dark
      ctx.fillRect(x + 9, y + 12, 8, 2)
      break
    case 'cloud':
      ctx.fillRect(x + 4, y + 6, width - 8, 2)
      break
    case 'pipe':
      for (let drawer = y + 8; drawer + 11 < y + height; drawer += 19) {
        ctx.fillStyle = colors.dark
        ctx.fillRect(x + 4, drawer, width - 8, 14)
        ctx.fillStyle = colors.detail
        ctx.fillRect(x + 5, drawer + 1, width - 10, 9)
        ctx.fillStyle = colors.dark
        ctx.fillRect(x + width / 2 - 4, drawer + 4, 8, 2)
      }
      break
  }
}

/**
 * Draw the status strip anchored to the viewport.
 * @param {CanvasRenderingContext2D} ctx - Canvas drawing context
 * @param {MarioGameState} state - Current game state
 * @param {number} width - Viewport width
 * @param {boolean} workflow - Whether the campaign workflow is active
 */
export function drawBotvarHud(
  ctx: CanvasRenderingContext2D,
  state: MarioGameState,
  width: number,
  workflow = false,
): void {
  ctx.save()
  ctx.fillStyle = '#1e1a2a'
  ctx.fillRect(12, 13, width - 24, 36)
  ctx.fillStyle = '#776178'
  ctx.fillRect(12, 13, width - 24, 2)
  ctx.fillStyle = '#f3cb8c'
  ctx.font = 'bold 14px monospace'
  const titles = workflow ? BOTVAR_STAGE_TITLES : STAGE_TITLE
  ctx.fillText(titles[state.level - 1] ?? `Bane ${state.level}`, 25, 36, 155)
  ctx.fillStyle = '#f3ecf4'
  ctx.font = '13px monospace'
  ctx.fillText(`Poeng ${state.score}`, 212, 36)
  ctx.fillText(`Liv ${state.player.lives}`, 320, 36)
  ctx.fillText(`Notater ${state.coinsCollected}`, 424, 36)
  if (state.timeRemaining !== null) {
    ctx.fillText(`Tid ${Math.ceil(state.timeRemaining)}`, 540, 36)
  }
  if (state.player.powerUp === 'fire') {
    ctx.fillStyle = '#f3cb8c'
    ctx.fillText('Z  Stempel', width - 110, 36)
  }
  ctx.restore()
}

const WORKFLOW_INK = '#262033'
const WORKFLOW_PAPER = '#fff0c6'
const WORKFLOW_STAMP = '#f58a91'
const WORKFLOW_APPROVED = '#7bdab2'

/**
 * Draw a sheet with handwritten lines.
 * @param {CanvasRenderingContext2D} ctx - Canvas drawing context
 * @param {number} x - Left edge of the sheet
 * @param {number} y - Top edge of the sheet
 */
function drawProposalSheet(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = WORKFLOW_INK
  ctx.fillRect(x - 1, y - 1, 26, 30)
  ctx.fillStyle = WORKFLOW_PAPER
  ctx.fillRect(x, y, 24, 28)
  ctx.fillStyle = '#96829e'
  ctx.fillRect(x + 4, y + 5, 12, 2)
  ctx.fillRect(x + 4, y + 11, 16, 1)
  ctx.fillRect(x + 4, y + 15, 16, 1)
  ctx.fillRect(x + 4, y + 19, 10, 1)
}

/**
 * Draw the workplace scenes at the corresponding milestones.
 * @param {CanvasRenderingContext2D} ctx - Canvas context in world coordinates
 * @param {MarioGameState} state - Current simulation state
 * @param {number} width - Viewport width
 */
export function drawBotvarWorkflowStations(ctx: CanvasRenderingContext2D, state: MarioGameState, width: number): void {
  const current = getBotvarMilestone(state)
  for (const station of getBotvarStations(state)) {
    const x = getBotvarStationX(state, station) + 42
    const y = 144
    if (x + 172 < state.cameraX || x > state.cameraX + width) continue

    ctx.save()
    ctx.translate(x, y)
    ctx.fillStyle = WORKFLOW_INK
    ctx.fillRect(0, 0, 172, 100)
    ctx.fillStyle = station === current ? WORKFLOW_APPROVED : '#bc9cb0'
    ctx.fillRect(2, 2, 168, 2)
    ctx.fillStyle = '#4d415d'
    ctx.fillRect(3, 6, 166, 59)
    ctx.fillStyle = '#896d84'
    ctx.fillRect(3, 62, 166, 5)
    ctx.fillStyle = '#655169'
    ctx.fillRect(7, 67, 158, 5)
    ctx.fillStyle = WORKFLOW_PAPER
    ctx.font = 'bold 11px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(station.title, 86, 88)

    switch (station.scene) {
      case 'author':
        drawBotvarColleague(ctx, 52, 21, '#bf7e99', '#d6a473', '#604756')
        drawProposalSheet(ctx, 93, 33)
        ctx.fillStyle = WORKFLOW_STAMP
        ctx.fillRect(107, 47, 7, 2)
        ctx.fillRect(114, 43, 2, 5)
        break
      case 'signers':
        drawBotvarColleague(ctx, 24, 21, '#ad9ac4', '#edbd9a', '#8d6048')
        drawBotvarColleague(ctx, 56, 21, '#9bc8bb', '#b67852', '#503844')
        drawBotvarColleague(ctx, 88, 21, '#cf9e68', '#f0ccaa', '#7d5541')
        drawProposalSheet(ctx, 120, 33)
        ctx.fillStyle = WORKFLOW_STAMP
        ctx.fillRect(124, 54, 12, 3)
        break
      case 'presenter':
        drawBotvarColleague(ctx, 26, 21, '#bf7e99', '#d6a473', '#604756')
        drawBotvarColleague(ctx, 121, 21, '#84bad4', '#f0ccaa', '#302d45')
        drawProposalSheet(ctx, 72 + (station === current ? Math.floor((state.gameTime * 15) % 24) : 0), 31)
        break
      case 'calendar':
        drawBotvarColleague(ctx, 40, 21, '#cfa76c', '#edbd9a', '#965a53')
        drawProposalSheet(ctx, 99, 24)
        ctx.fillStyle = WORKFLOW_STAMP
        ctx.fillRect(99, 24, 24, 5)
        ctx.fillRect(104, 37, 4, 4)
        ctx.fillRect(114, 43, 4, 4)
        break
      case 'check':
        drawBotvarColleague(ctx, 44, 21, '#cfa76c', '#edbd9a', '#965a53')
        drawProposalSheet(ctx, 96, 32)
        ctx.fillStyle = WORKFLOW_APPROVED
        ctx.fillRect(111, 50, 16, 11)
        ctx.fillStyle = WORKFLOW_INK
        ctx.fillRect(114, 55, 4, 2)
        ctx.fillRect(118, 53, 6, 2)
        break
      case 'agenda':
        ctx.fillStyle = WORKFLOW_PAPER
        ctx.fillRect(42, 20, 88, 37)
        ctx.fillStyle = '#96829e'
        for (let row = 27; row < 54; row += 7) {
          ctx.fillRect(55, row, 59, 2)
        }
        ctx.fillStyle = WORKFLOW_STAMP
        ctx.fillRect(50, 41, 3, 3)
        ctx.fillRect(55, 41, 66, 2)
        break
      case 'meeting':
        drawBotvarColleague(ctx, 74, 20, '#84bad4', '#f0ccaa', '#302d45')
        ctx.fillStyle = '#896d84'
        ctx.fillRect(62, 49, 48, 13)
        ctx.fillStyle = WORKFLOW_PAPER
        ctx.fillRect(92, 46, 12, 3)
        break
      case 'committee':
        drawBotvarColleague(ctx, 36, 21, '#ad9ac4', '#e2b08e', '#814958')
        drawBotvarColleague(ctx, 74, 21, '#cf9e68', '#b67852', '#503844')
        drawBotvarColleague(ctx, 112, 21, '#9bc8bb', '#f0ccaa', '#7d5541')
        ctx.fillStyle = WORKFLOW_PAPER
        ctx.fillRect(75, 58, 20, 3)
        break
      case 'approver':
        drawBotvarColleague(ctx, 50, 21, '#9bc8bb', '#c18e64', '#273c54')
        drawProposalSheet(ctx, 98, 34)
        ctx.fillStyle = WORKFLOW_APPROVED
        ctx.fillRect(113, 48, 11, 9)
        break
      case 'temporary':
      case 'publish':
        drawProposalSheet(ctx, 67, 25)
        drawProposalSheet(ctx, 81, 33)
        ctx.fillStyle = station.scene === 'publish' ? WORKFLOW_APPROVED : WORKFLOW_STAMP
        ctx.fillRect(95, 49, 19, 9)
        ctx.fillStyle = WORKFLOW_INK
        ctx.fillRect(99, 53, 11, 1)
        break
    }
    ctx.restore()
  }
}
