import type { JSX } from 'react'

import type { Ship } from './types'

import { BaseMaritimeGame } from './BaseMaritimeGame'

interface UndockingGameProps {
  readonly onComplete: (success: boolean, bonus: number, penalty?: number) => void
  readonly onExit: () => void
  readonly ship?: Ship
}

/**
 * Undocking game component - wrapper around BaseMaritimeGame
 * @param props The component props
 * @param props.onComplete Callback function called when undocking completes
 * @param props.onExit Callback function called when exiting the game
 * @param props.ship The ship object being used
 * @returns {JSX.Element} JSX element for the undocking game
 */
function UndockingGame({ onComplete, onExit, ship }: UndockingGameProps): JSX.Element {
  // Convert onComplete callback to the format expected by BaseMaritimeGame
  const handleComplete = (success: boolean, _bonus: number, penalty: number = 0): void => {
    // Always call onComplete regardless of success/failure so the ship state gets updated
    onComplete(success, 0, penalty)
  }

  // Provide default ship if none provided
  const gameShip: Ship = ship || {
    capacity: 1000,
    condition: 100,
    cost: 50000,
    id: 'default-ship',
    location: 'harbour',
    name: 'Default Ship',
    speed: 5,
    type: 'cargo'
  }

  return (
    <div style={{ position: 'relative' }}>
      <BaseMaritimeGame
        gameType="undocking"
        onComplete={handleComplete}
        ship={gameShip}
      />
      <button
        onClick={onExit}
        style={{
          background: '#ff4444',
          border: 'none',
          borderRadius: '5px',
          color: 'white',
          cursor: 'pointer',
          fontSize: '16px',
          padding: '10px 20px',
          position: 'absolute',
          right: '10px',
          top: '10px'
        }}
        type="button"
      >
        Exit
      </button>
    </div>
  )
}

export default UndockingGame
