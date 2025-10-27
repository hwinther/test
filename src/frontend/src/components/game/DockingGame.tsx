import type { JSX } from 'react'

import type { Ship } from './types'

import { BaseMaritimeGame } from './BaseMaritimeGame'

interface DockingGameProps {
  readonly onComplete: (success: boolean, bonus: number) => void
  readonly ship: Ship
}

/**
 * Docking game component - wrapper around BaseMaritimeGame
 * @param {DockingGameProps} props - The component props
 * @param {(success: boolean, bonus: number) => void} props.onComplete - Callback function called when the game completes
 * @param {Ship} props.ship - The ship object being docked
 * @returns {JSX.Element} JSX element for the docking game
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
