import type { JSX } from 'react'
import type { Ship } from './types'

const INITIAL_PORTS = [
  { country: 'USA', difficulty: 1, dockingFee: 500, id: 'ny', name: 'New York' },
  { country: 'UK', difficulty: 2, dockingFee: 800, id: 'london', name: 'London' },
  { country: 'Japan', difficulty: 3, dockingFee: 1200, id: 'tokyo', name: 'Tokyo' },
  { country: 'Germany', difficulty: 2, dockingFee: 700, id: 'hamburg', name: 'Hamburg' },
  { country: 'Singapore', difficulty: 4, dockingFee: 1500, id: 'singapore', name: 'Singapore' }
]

interface WorldMapProps {
  readonly travelingShip: Ship
  readonly gameState: { money: number }
  readonly onPortSelection: (portId: string) => void
  readonly onClose: () => void
}

export function WorldMap({ travelingShip, gameState, onPortSelection, onClose }: WorldMapProps): JSX.Element {
  return (
    <div className="world-map-overlay">
      <div className="world-map">
        <h2>Select Destination for {travelingShip.name}</h2>
        <p>Travel Cost: $2,000</p>
        
        <div className="ocean-map">
          {/* Ocean background with waves */}
          <div className="ocean-background">
            <div className="wave wave-1"></div>
            <div className="wave wave-2"></div>
            <div className="wave wave-3"></div>
          </div>
          
          {/* Continents */}
          <div className="continent north-america">
            <div className="continent-shape"></div>
          </div>
          <div className="continent europe">
            <div className="continent-shape"></div>
          </div>
          <div className="continent asia">
            <div className="continent-shape"></div>
          </div>
          
          {/* Port markers positioned on the map */}
          {INITIAL_PORTS.map(port => (
            <button
              className={`port-marker port-${port.id}`}
              disabled={gameState.money < 2000}
              key={port.id}
              onClick={() => onPortSelection(port.id)}
              title={`${port.name}, ${port.country} - Docking Fee: $${port.dockingFee}`}
            >
              <div className="port-dot"></div>
              <div className="port-label">{port.name}</div>
            </button>
          ))}
          
          {/* Current ship position indicator */}
          <div className={`ship-marker traveling-ship-${travelingShip.location.replace('-docked', '')}`}>
            <div className="ship-icon">🚢</div>
          </div>
        </div>
        
        <div className="world-map-actions">
          <button className="cancel-travel-btn" onClick={onClose}>
            Cancel Travel
          </button>
        </div>
      </div>
    </div>
  )
}