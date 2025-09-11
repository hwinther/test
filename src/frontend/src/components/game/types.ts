export interface Cargo {
  destination: string
  id: string
  origin: string
  penalty: number
  timeLimit: number // days
  type: string
  value: number
  weight: number
}

export interface DockingGameState {
  docked: boolean
  obstacles: { height: number; width: number; x: number; y: number }[]
  shipAngle: number
  shipSpeed: number
  shipX: number
  shipY: number
  targetX: number
  targetY: number
  timeLeft: number
}

export interface GameState {
  completedJobs: number
  currentPort: string
  gameTime: number // days
  money: number
  reputation: number // 0-100
  ships: Ship[]
}

export interface MiniGameResult {
  bonus: number
  score: number
  success: boolean
}

export interface Port {
  country: string
  difficulty: number // 1-5
  dockingFee: number
  id: string
  name: string
}

export interface RescueGameState {
  boatX: number
  boatY: number
  rescuedCount: number
  survivors: { id: string; rescued: boolean; x: number; y: number }[]
  timeLeft: number
  waves: { height: number; x: number; y: number }[]
}

export interface Ship {
  capacity: number
  condition: number // 0-100
  cost: number
  id: string
  location: string
  name: string
  speed: number
  type: 'cargo' | 'container' | 'tanker'
}
