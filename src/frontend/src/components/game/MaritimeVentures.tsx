/* eslint-disable sonarjs/pseudo-random */
import { type JSX, useCallback, useEffect, useState } from 'react'

import type { Cargo, GameState, Port, Ship } from './types'

import { DockingGame } from './DockingGame'
import { RescueGame } from './RescueGame'
import './MaritimeVentures.css'

const INITIAL_PORTS: Port[] = [
  { country: 'USA', difficulty: 1, dockingFee: 500, id: 'ny', name: 'New York' },
  { country: 'UK', difficulty: 2, dockingFee: 800, id: 'london', name: 'London' },
  { country: 'Japan', difficulty: 3, dockingFee: 1200, id: 'tokyo', name: 'Tokyo' },
  { country: 'Germany', difficulty: 2, dockingFee: 700, id: 'hamburg', name: 'Hamburg' },
  { country: 'Singapore', difficulty: 4, dockingFee: 1500, id: 'singapore', name: 'Singapore' }
]

const INITIAL_SHIPS: Ship[] = [
  {
    capacity: 1000,
    condition: 85,
    cost: 50000,
    id: 'ship1',
    location: 'ny',
    name: 'SS Starter',
    speed: 12,
    type: 'cargo'
  }
]

const CARGO_TYPES = ['Electronics', 'Textiles', 'Machinery', 'Food', 'Oil', 'Containers']

interface MaritimeVenturesProps {
  readonly onClose?: () => void
}

/**
 * Main game component for the Maritime Ventures Easter egg
 * @param {MaritimeVenturesProps} props - Component properties
 * @returns {JSX.Element} The game interface
 */
export function MaritimeVentures({ onClose }: MaritimeVenturesProps): JSX.Element {
  const [gameState, setGameState] = useState<GameState>({
    completedJobs: 0,
    currentPort: 'ny',
    gameTime: 0,
    money: 25000,
    reputation: 50,
    ships: INITIAL_SHIPS
  })

  const [availableCargo, setAvailableCargo] = useState<Cargo[]>([])
  const [selectedShip, setSelectedShip] = useState<null | Ship>(null)
  const [currentMiniGame, setCurrentMiniGame] = useState<'docking' | 'rescue' | null>(null)
  const [gameActive, setGameActive] = useState(true)

  const generateCargo = useCallback((): Cargo[] => {
    const cargo: Cargo[] = []
    const numberOfJobs = Math.floor(Math.random() * 5) + 3

    for (let i = 0; i < numberOfJobs; i++) {
      const origin = INITIAL_PORTS[Math.floor(Math.random() * INITIAL_PORTS.length)]
      let destination = INITIAL_PORTS[Math.floor(Math.random() * INITIAL_PORTS.length)]
      
      while (destination.id === origin.id) {
        destination = INITIAL_PORTS[Math.floor(Math.random() * INITIAL_PORTS.length)]
      }

      const cargoType = CARGO_TYPES[Math.floor(Math.random() * CARGO_TYPES.length)]
      const weight = Math.floor(Math.random() * 800) + 200
      const distance = Math.floor(Math.random() * 20) + 5
      const baseValue = weight * (2 + destination.difficulty)

      cargo.push({
        destination: destination.id,
        id: `cargo_${i}_${Date.now()}`,
        origin: origin.id,
        penalty: Math.floor(baseValue * 0.3),
        timeLimit: distance + Math.floor(Math.random() * 10),
        type: cargoType,
        value: baseValue,
        weight
      })
    }

    return cargo
  }, [])

  const handleShipAction = (shipId: string, action: 'dock' | 'rescue'): void => {
    const ship = gameState.ships.find(s => s.id === shipId)
    if (ship) {
      setSelectedShip(ship)
      setCurrentMiniGame(action === 'dock' ? 'docking' : 'rescue')
    }
  }

  const handleMiniGameComplete = (success: boolean, bonus: number): void => {
    if (success && selectedShip) {
      setGameState(prev => ({
        ...prev,
        money: prev.money + bonus,
        reputation: Math.min(100, prev.reputation + 2)
      }))
    }
    setCurrentMiniGame(null)
    setSelectedShip(null)
  }

  const buyShip = (shipType: Ship['type']): void => {
    const costs = { cargo: 50000, container: 80000, tanker: 120000 }
    const cost = costs[shipType]

    if (gameState.money >= cost) {
      const getCapacity = (type: Ship['type']): number => {
        if (type === 'tanker') return 2000
        if (type === 'container') return 1500
        return 1000
      }

      const getSpeed = (type: Ship['type']): number => {
        if (type === 'cargo') return 15
        if (type === 'container') return 18
        return 12
      }

      const newShip: Ship = {
        capacity: getCapacity(shipType),
        condition: 100,
        cost,
        id: `ship_${Date.now()}`,
        location: gameState.currentPort,
        name: `${shipType.charAt(0).toUpperCase() + shipType.slice(1)} ${gameState.ships.length + 1}`,
        speed: getSpeed(shipType),
        type: shipType
      }

      setGameState(prev => ({
        ...prev,
        money: prev.money - cost,
        ships: [...prev.ships, newShip]
      }))
    }
  }

  const addDevMoney = (): void => {
    setGameState(prev => ({
      ...prev,
      money: prev.money + 500000
    }))
  }

  const getBestForText = (shipType: Ship['type']): string => {
    switch (shipType) {
      case 'cargo': return 'General cargo'
      case 'container': return 'Containers'
      case 'tanker': return 'Oil & liquids'
      default: return 'General cargo'
    }
  }

  const acceptCargo = (cargoId: string, shipId: string): void => {
    const cargo = availableCargo.find(c => c.id === cargoId)
    const ship = gameState.ships.find(s => s.id === shipId)

    if (cargo && ship && ship.location === cargo.origin) {
      // Start voyage
      setGameState(prev => ({
        ...prev,
        completedJobs: prev.completedJobs + 1,
        money: prev.money + cargo.value - INITIAL_PORTS.find(p => p.id === cargo.destination)!.dockingFee
      }))

      setAvailableCargo(prev => prev.filter(c => c.id !== cargoId))
    }
  }

  useEffect(() => {
    setAvailableCargo(generateCargo())
    
    // Game timer
    const timer = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        gameTime: prev.gameTime + 1
      }))
    }, 5000) // 1 game day = 5 seconds

    return () => clearInterval(timer)
  }, [generateCargo])

  const currentPortData = INITIAL_PORTS.find(p => p.id === gameState.currentPort)

  if (currentMiniGame === 'docking' && selectedShip) {
    return <DockingGame onComplete={handleMiniGameComplete} ship={selectedShip} />
  }

  if (currentMiniGame === 'rescue' && selectedShip) {
    return <RescueGame onComplete={handleMiniGameComplete} ship={selectedShip} />
  }

  return (
    <div className="maritime-ventures-game">
      <div className="game-header">
        <h1>Maritime Ventures</h1>
        <div className="game-stats">
          <span>Money: ${gameState.money.toLocaleString()}</span>
          <span>Day: {gameState.gameTime}</span>
          <span>Jobs: {gameState.completedJobs}</span>
          <span>Reputation: {gameState.reputation}%</span>
        </div>
        <div className="game-controls">
          <button className="dev-button" onClick={addDevMoney}>+$500K</button>
          <button className="close-game" onClick={() => onClose ? onClose() : setGameActive(false)}>×</button>
        </div>
      </div>

      {gameActive ? (
        <div className="game-content">
          <div className="left-panel">
            <div className="current-port">
              <h3>Current Port: {currentPortData?.name}</h3>
              <p>Country: {currentPortData?.country}</p>
              <p>Docking Fee: ${currentPortData?.dockingFee}</p>
            </div>

            <div className="your-ships">
              <h3>Your Fleet</h3>
              {gameState.ships.map(ship => (
                <div className="ship-card" key={ship.id}>
                  <div className={`ship-preview ${ship.type}-ship`}></div>
                  <div className="ship-info">
                    <h4>{ship.name}</h4>
                    <p>Type: {ship.type} | Capacity: {ship.capacity}t</p>
                    <p>Speed: {ship.speed} knots</p>
                    <p>Best for: {getBestForText(ship.type)}</p>
                    <p>Location: {INITIAL_PORTS.find(p => p.id === ship.location)?.name}</p>
                    <p>Condition: {ship.condition}%</p>
                  </div>
                  <div className="ship-actions">
                    <button onClick={() => handleShipAction(ship.id, 'dock')}>
                      Dock Ship
                    </button>
                    <button onClick={() => handleShipAction(ship.id, 'rescue')}>
                      Rescue Mission
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="ship-market">
              <h3>Ship Market</h3>
              <div className="ship-options">
                <div className="ship-market-card">
                  <div className="ship-preview cargo-ship"></div>
                  <div className="ship-details">
                    <h4>Cargo Ship</h4>
                    <p>Capacity: 1,000t</p>
                    <p>Speed: 15 knots</p>
                    <p>Best for: General cargo</p>
                  </div>
                  <button 
                    className="buy-ship-btn"
                    disabled={gameState.money < 50000} 
                    onClick={() => buyShip('cargo')}
                  >
                    Buy $50,000
                  </button>
                </div>
                
                <div className="ship-market-card">
                  <div className="ship-preview container-ship"></div>
                  <div className="ship-details">
                    <h4>Container Ship</h4>
                    <p>Capacity: 1,500t</p>
                    <p>Speed: 18 knots</p>
                    <p>Best for: Containers</p>
                  </div>
                  <button 
                    className="buy-ship-btn"
                    disabled={gameState.money < 80000} 
                    onClick={() => buyShip('container')}
                  >
                    Buy $80,000
                  </button>
                </div>
                
                <div className="ship-market-card">
                  <div className="ship-preview tanker-ship"></div>
                  <div className="ship-details">
                    <h4>Tanker</h4>
                    <p>Capacity: 2,000t</p>
                    <p>Speed: 12 knots</p>
                    <p>Best for: Oil & liquids</p>
                  </div>
                  <button 
                    className="buy-ship-btn"
                    disabled={gameState.money < 120000} 
                    onClick={() => buyShip('tanker')}
                  >
                    Buy $120,000
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="right-panel">
            <div className="available-cargo">
              <h3>Available Cargo</h3>
              {availableCargo.map(cargo => {
                const origin = INITIAL_PORTS.find(p => p.id === cargo.origin)
                const destination = INITIAL_PORTS.find(p => p.id === cargo.destination)
                const availableShips = gameState.ships.filter(s => s.location === cargo.origin)
                
                return (
                  <div className="cargo-card" key={cargo.id}>
                    <h4>{cargo.type}</h4>
                    <p>From: {origin?.name} → {destination?.name}</p>
                    <p>Weight: {cargo.weight}t | Value: ${cargo.value.toLocaleString()}</p>
                    <p>Time Limit: {cargo.timeLimit} days</p>
                    
                    {availableShips.length > 0 && (
                      <div className="cargo-actions">
                        <select onChange={(e) => {
                          if (e.target.value) {
                            acceptCargo(cargo.id, e.target.value)
                          }
                        }}>
                          <option value="">Select Ship</option>
                          {availableShips.map(ship => (
                            <option key={ship.id} value={ship.id}>
                              {ship.name} ({ship.capacity}t)
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
