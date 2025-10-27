import type { JSX } from 'react'
import type { Cargo, Ship } from './types'
import { canAcceptCargo, getShipRemainingCapacity } from './shipUtils'

const INITIAL_PORTS = [
  { country: 'USA', difficulty: 1, dockingFee: 500, id: 'ny', name: 'New York' },
  { country: 'UK', difficulty: 2, dockingFee: 800, id: 'london', name: 'London' },
  { country: 'Japan', difficulty: 3, dockingFee: 1200, id: 'tokyo', name: 'Tokyo' },
  { country: 'Germany', difficulty: 2, dockingFee: 700, id: 'hamburg', name: 'Hamburg' },
  { country: 'Singapore', difficulty: 4, dockingFee: 1500, id: 'singapore', name: 'Singapore' }
]

interface AvailableCargoProps {
  readonly availableCargo: Cargo[]
  readonly gameState: { ships: Ship[] }
  readonly onAcceptCargo: (cargoId: string, shipId: string) => void
}

function getUnavailabilityReason(
  cargo: Cargo, 
  shipsAtPort: Ship[], 
  shipsAtOrigin: Ship[], 
  availableShips: Ship[]
): string {
  const origin = INITIAL_PORTS.find(p => p.id === cargo.origin)
  
  if (shipsAtPort.length === 0) {
    if (shipsAtOrigin.length === 0) {
      return `No ships at ${origin?.name || cargo.origin}`
    } else {
      const dockedCount = shipsAtOrigin.filter(s => s.location === `${cargo.origin}-docked`).length
      const sailingCount = shipsAtOrigin.filter(s => s.location === cargo.origin).length
      if (sailingCount > 0 && dockedCount === 0) {
        return `${sailingCount} ship${sailingCount > 1 ? 's' : ''} at ${origin?.name || cargo.origin} but not docked`
      } else {
        return `No suitable ships available at ${origin?.name || cargo.origin}`
      }
    }
  } else if (availableShips.length === 0) {
    return `Ships at port but insufficient capacity for ${cargo.weight}t cargo`
  }
  
  return ""
}

export function AvailableCargo({ availableCargo, gameState, onAcceptCargo }: AvailableCargoProps): JSX.Element {
  return (
    <div className="available-cargo">
      <h3>Available Cargo</h3>
      {availableCargo.map(cargo => {
        const origin = INITIAL_PORTS.find(p => p.id === cargo.origin)
        const destination = INITIAL_PORTS.find(p => p.id === cargo.destination)
        const shipsAtPort = gameState.ships.filter(s => s.location === `${cargo.origin}-docked`)
        const availableShips = shipsAtPort.filter(s => canAcceptCargo(s, cargo))
        const shipsAtOrigin = gameState.ships.filter(s => s.location === cargo.origin || s.location === `${cargo.origin}-docked`)
        
        const unavailabilityReason = getUnavailabilityReason(cargo, shipsAtPort, shipsAtOrigin, availableShips)
        
        return (
          <div className="cargo-card" key={cargo.id}>
            <h4>{cargo.type}</h4>
            <p>From: {origin?.name} → {destination?.name}</p>
            <p>Weight: {cargo.weight}t | Value: ${cargo.value.toLocaleString()}</p>
            <p>Time Limit: {cargo.timeLimit} days</p>
            
            {shipsAtPort.length > 0 ? (
              <div className="cargo-actions">
                <select onChange={(e) => {
                  if (e.target.value) {
                    onAcceptCargo(cargo.id, e.target.value)
                  }
                }}>
                  <option value="">Select Ship</option>
                  {availableShips.map(ship => (
                    <option key={ship.id} value={ship.id}>
                      {ship.name} ({getShipRemainingCapacity(ship)}t available)
                    </option>
                  ))}
                  {shipsAtPort.filter(s => !canAcceptCargo(s, cargo)).map(ship => (
                    <option disabled key={`disabled-${ship.id}`} value="">
                      {ship.name} (Insufficient capacity: {getShipRemainingCapacity(ship)}t available, need {cargo.weight}t)
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="cargo-unavailable">
                <p className="unavailable-reason">{unavailabilityReason}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}