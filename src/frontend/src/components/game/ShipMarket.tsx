import type { JSX } from 'react'
import { getBestForText, getShipScale } from './shipUtils'

interface ShipMarketProps {
  readonly gameState: { money: number }
  readonly onBuyShip: (shipType: 'cargo' | 'container' | 'tanker') => void
}

const shipTypes = [
  { type: 'cargo' as const, name: 'Cargo Ship', capacity: 1000, speed: 15, cost: 50000 },
  { type: 'container' as const, name: 'Container Ship', capacity: 1500, speed: 18, cost: 80000 },
  { type: 'tanker' as const, name: 'Tanker', capacity: 2000, speed: 12, cost: 120000 }
]

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