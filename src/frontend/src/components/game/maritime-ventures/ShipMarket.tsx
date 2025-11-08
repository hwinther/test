import type { JSX } from 'react'

import { getBestForText, getShipScale } from './shipUtils'

interface ShipMarketProps {
  readonly gameState: { money: number }
  readonly onBuyShip: (shipType: 'cargo' | 'container' | 'tanker') => void
}

const shipTypes = [
  { capacity: 1000, cost: 50000, name: 'Cargo Ship', speed: 15, type: 'cargo' as const },
  { capacity: 1500, cost: 80000, name: 'Container Ship', speed: 18, type: 'container' as const },
  { capacity: 2000, cost: 120000, name: 'Tanker', speed: 12, type: 'tanker' as const }
]

/**
 * Component that displays the ship market where players can purchase new ships
 * @param {ShipMarketProps} props - The component props
 * @param {{ money: number }} props.gameState - Current game state with player's money
 * @param {(shipType: 'cargo' | 'container' | 'tanker') => void} props.onBuyShip - Callback function to purchase a ship
 * @returns {JSX.Element} JSX element rendering the ship market interface
 */
export function ShipMarket({ gameState, onBuyShip }: ShipMarketProps): JSX.Element {
  return (
    <div className="ship-market">
      <h3>Ship Market</h3>
      <div className="ship-market-cards">
        {shipTypes.map(ship => (
          <div className="ship-market-card" key={ship.type}>
            <div 
              className={`ship-preview ${ship.type}-ship`}
              style={{ 
                transform: `scaleX(${getShipScale(ship.capacity)})`,
                transformOrigin: 'left center'
              }}
            ></div>
            <div className="ship-details">
              <h4>{ship.name}</h4>
              <p>Capacity: {ship.capacity.toLocaleString()}t</p>
              <p>Speed: {ship.speed} knots</p>
              <p>Best for: {getBestForText(ship.type)}</p>
            </div>
            <button 
              className="buy-ship-btn"
              disabled={gameState.money < ship.cost} 
              onClick={() => onBuyShip(ship.type)}
            >
              Buy ${ship.cost.toLocaleString()}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}