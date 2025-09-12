import type { JSX } from 'react'

import type { Ship } from './types'

import { BaseMaritimeGame } from './BaseMaritimeGame'

interface DockingGameProps {
  readonly onComplete: (success: boolean, bonus: number) => void
  readonly ship: Ship
}

/**
 * Docking game component - wrapper around BaseMaritimeGame
 * @param props - The component props
 * @param props.onComplete - Callback function called when the game completes
 * @param props.ship - The ship object being docked
 * @returns JSX element for the docking game
 */
export function DockingGame({ onComplete, ship }: DockingGameProps): JSX.Element {
  return (
    <BaseMaritimeGame
      gameType="docking"
      onComplete={onComplete}
      ship={ship}
    />
  )
}
