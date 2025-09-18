/* eslint-disable sonarjs/pseudo-random */
import { type JSX, useCallback, useEffect, useState } from 'react'

import type { Cargo, GameState, Port, Ship } from './types'

import { DockingGame } from './DockingGame'
import { RescueGame } from './RescueGame'
import UndockingGame from './UndockingGame'
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
    location: 'ny-docked',
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
  const [currentMiniGame, setCurrentMiniGame] = useState<'docking' | 'rescue' | 'undocking' | null>(null)
  const [gameActive, setGameActive] = useState(true)
  const [showWorldMap, setShowWorldMap] = useState(false)
  const [travelingShip, setTravelingShip] = useState<null | Ship>(null)

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

  const getShipCargoWeight = (ship: Ship): number => {
    return ship.cargo?.reduce((total, cargo) => total + cargo.weight, 0) || 0
  }

  const getShipRemainingCapacity = (ship: Ship): number => {
    return ship.capacity - getShipCargoWeight(ship)
  }

  const canAcceptCargo = (ship: Ship, cargo: Cargo): boolean => {
    return getShipRemainingCapacity(ship) >= cargo.weight
  }

  const handleShipAction = (shipId: string, action: 'dock' | 'rescue' | 'undock'): void => {
    const ship = gameState.ships.find(s => s.id === shipId)
    if (ship) {
      // Determine new location suffix
      let locationSuffix = '-rescue'
      if (action === 'dock') {
        locationSuffix = '-waiting'
      } else if (action === 'undock') {
        locationSuffix = '-undocking'
      }
      
      // Determine mini-game type
      let miniGameType: 'docking' | 'rescue' | 'undocking' = 'rescue'
      if (action === 'dock') {
        miniGameType = 'docking'
      } else if (action === 'undock') {
        miniGameType = 'undocking'
      }
      
      // Update ship location to show it's engaged in the action
      setGameState(prev => ({
        ...prev,
        ships: prev.ships.map(s => 
          s.id === shipId 
            ? { ...s, location: `${s.location}${locationSuffix}` }
            : s
        )
      }))
      
      setSelectedShip(ship)
      setCurrentMiniGame(miniGameType)
    }
  }

  const handleTowingService = (shipId: string): void => {
    const towingCost = 1000 // $1000 for towing service
    
    if (gameState.money >= towingCost) {
      setGameState(prev => ({
        ...prev,
        money: prev.money - towingCost,
        ships: prev.ships.map(ship => 
          ship.id === shipId 
            ? { ...ship, location: `${ship.location}-docked` }
            : ship
        )
      }))
    }
  }

  const handleTravelToPort = (shipId: string): void => {
    const ship = gameState.ships.find(s => s.id === shipId)
    if (ship) {
      setTravelingShip(ship)
      setShowWorldMap(true)
    }
  }

  const handlePortSelection = (portId: string): void => {
    if (travelingShip) {
      const travelCost = 2000 // Base travel cost
      
      if (gameState.money >= travelCost) {
        // Check for cargo deliveries at this port
        const deliverableCargo = travelingShip.cargo?.filter(cargo => cargo.destination === portId) || []
        const remainingCargo = travelingShip.cargo?.filter(cargo => cargo.destination !== portId) || []
        
        // Calculate delivery earnings
        const deliveryEarnings = deliverableCargo.reduce((total, cargo) => total + cargo.value, 0)
        const dockingFee = INITIAL_PORTS.find(p => p.id === portId)?.dockingFee || 0
        
        setGameState(prev => ({
          ...prev,
          completedJobs: prev.completedJobs + deliverableCargo.length,
          money: prev.money - travelCost + deliveryEarnings - dockingFee,
          ships: prev.ships.map(ship => 
            ship.id === travelingShip.id 
              ? { ...ship, cargo: remainingCargo, location: portId }
              : ship
          )
        }))
      }
      
      setShowWorldMap(false)
      setTravelingShip(null)
    }
  }

  const handleUndockingTowingService = (shipId: string): void => {
    const towingCost = 1000 // $1000 for undocking towing service
    
    if (gameState.money >= towingCost) {
      setGameState(prev => ({
        ...prev,
        money: prev.money - towingCost,
        ships: prev.ships.map(ship => 
          ship.id === shipId 
            ? { ...ship, location: ship.location.replace('-docked', '') }
            : ship
        )
      }))
    }
  }

  const handleMiniGameComplete = (success: boolean, bonus: number, penalty: number = 0): void => {
    setGameState(prev => {
      let newMoney = prev.money
      let newReputation = prev.reputation

      if (success && selectedShip) {
        newMoney += bonus
        newReputation = Math.min(100, newReputation + 2)
      }

      // Apply penalty for damages (collision, etc.)
      if (penalty > 0) {
        newMoney = Math.max(0, newMoney - penalty)
        newReputation = Math.max(0, newReputation - 5) // Reputation hit for damages
      }

      // Update ship location based on mini-game result
      const updatedShips = selectedShip ? prev.ships.map(ship => {
        if (ship.id === selectedShip.id) {
          let baseLocation = ship.location.replace('-waiting', '').replace('-rescue', '').replace('-undocking', '')
          
          if (currentMiniGame === 'docking') {
            return { 
              ...ship, 
              location: success ? `${baseLocation}-docked` : baseLocation 
            }
          } else if (currentMiniGame === 'rescue') {
            return { 
              ...ship, 
              location: baseLocation 
            }
          } else if (currentMiniGame === 'undocking') {
            // For undocking, if the ship is currently docked, we need to handle it differently
            if (baseLocation.endsWith('-docked')) {
              const portLocation = baseLocation.replace('-docked', '')
              const newLocation = success ? portLocation : baseLocation
              return { 
                ...ship, 
                location: newLocation
              }
            } else {
              const newLocation = success ? baseLocation : `${baseLocation}-docked`
              return { 
                ...ship, 
                location: newLocation
              }
            }
          }
        }
        return ship
      }) : prev.ships

      return {
        ...prev,
        money: newMoney,
        reputation: newReputation,
        ships: updatedShips
      }
    })
    
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
        location: `${gameState.currentPort}-docked`,
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

  const refreshCargo = (): void => {
    setAvailableCargo(generateCargo())
  }

  const sellShip = (shipId: string): void => {
    const ship = gameState.ships.find(s => s.id === shipId)
    
    if (ship?.location.endsWith('-docked')) {
      const sellPrice = Math.floor(ship.cost * 0.75) // 75% of original price
      
      setGameState(prev => ({
        ...prev,
        money: prev.money + sellPrice,
        ships: prev.ships.filter(s => s.id !== shipId)
      }))
    }
  }

  const getBestForText = (shipType: Ship['type']): string => {
    switch (shipType) {
      case 'cargo': return 'General cargo'
      case 'container': return 'Containers'
      case 'tanker': return 'Oil & liquids'
      default: return 'General cargo'
    }
  }

  const getShipScale = (capacity: number): number => {
    // Base scale factor - smallest ship (1000t) gets scale 1.0
    // Scale increases with capacity: 1000t=1.0, 1500t=1.25, 2000t=1.5
    const baseCapacity = 1000
    return Math.max(0.8, Math.min(1.6, capacity / baseCapacity))
  }

  const getLocationDisplay = (ship: Ship): string => {
    const portName = INITIAL_PORTS.find(p => p.id === ship.location.replace('-docked', '').replace('-waiting', '').replace('-rescue', ''))?.name || 'Unknown'
    
    if (ship.location.endsWith('-docked')) {
      return `${portName} (Docked)`
    } else if (ship.location.endsWith('-waiting')) {
      return `${portName} (Waiting to dock)`
    } else if (ship.location.endsWith('-rescue')) {
      return `${portName} (On rescue mission)`
    } else {
      return portName
    }
  }

  const acceptCargo = (cargoId: string, shipId: string): void => {
    const cargo = availableCargo.find(c => c.id === cargoId)
    const ship = gameState.ships.find(s => s.id === shipId)

    if (cargo && ship && ship.location === `${cargo.origin}-docked`) {
      // Check if ship has enough capacity
      if (!canAcceptCargo(ship, cargo)) {
        alert(`Cannot accept cargo: Ship capacity exceeded. Need ${cargo.weight}t but only ${getShipRemainingCapacity(ship)}t available.`)
        return
      }

      // Add cargo to ship
      setGameState(prev => ({
        ...prev,
        ships: prev.ships.map(s => 
          s.id === shipId 
            ? { ...s, cargo: [...(s.cargo || []), cargo] }
            : s
        )
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

  if (currentMiniGame === 'undocking' && selectedShip) {
    return <UndockingGame 
      onComplete={(success: boolean, penalty?: number) => 
        handleMiniGameComplete(success, 0, penalty || 0)
      } 
      onExit={() => {
        setCurrentMiniGame(null)
        setSelectedShip(null)
      }}
      ship={selectedShip}
    />
  }

  if (showWorldMap && travelingShip) {
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
            <button 
              className={`port-marker ${travelingShip.location === 'ny' ? 'current-port' : ''}`}
              disabled={travelingShip.location === 'ny'}
              onClick={() => handlePortSelection('ny')}
              style={{ left: '22%', top: '35%' }}
              title="New York, USA"
              type="button"
            >
              <div className="port-icon">🏙️</div>
              <div className="port-label">New York</div>
              {travelingShip.location === 'ny' && <div className="current-indicator">📍</div>}
            </button>

            <button 
              className={`port-marker ${travelingShip.location === 'london' ? 'current-port' : ''}`}
              disabled={travelingShip.location === 'london'}
              onClick={() => handlePortSelection('london')}
              style={{ left: '48%', top: '25%' }}
              title="London, UK"
              type="button"
            >
              <div className="port-icon">🏛️</div>
              <div className="port-label">London</div>
              {travelingShip.location === 'london' && <div className="current-indicator">📍</div>}
            </button>

            <button 
              className={`port-marker ${travelingShip.location === 'hamburg' ? 'current-port' : ''}`}
              disabled={travelingShip.location === 'hamburg'}
              onClick={() => handlePortSelection('hamburg')}
              style={{ left: '52%', top: '22%' }}
              title="Hamburg, Germany"
              type="button"
            >
              <div className="port-icon">🏭</div>
              <div className="port-label">Hamburg</div>
              {travelingShip.location === 'hamburg' && <div className="current-indicator">📍</div>}
            </button>

            <button 
              className={`port-marker ${travelingShip.location === 'tokyo' ? 'current-port' : ''}`}
              disabled={travelingShip.location === 'tokyo'}
              onClick={() => handlePortSelection('tokyo')}
              style={{ left: '85%', top: '38%' }}
              title="Tokyo, Japan"
              type="button"
            >
              <div className="port-icon">🏯</div>
              <div className="port-label">Tokyo</div>
              {travelingShip.location === 'tokyo' && <div className="current-indicator">📍</div>}
            </button>

            <button 
              className={`port-marker ${travelingShip.location === 'singapore' ? 'current-port' : ''}`}
              disabled={travelingShip.location === 'singapore'}
              onClick={() => handlePortSelection('singapore')}
              style={{ left: '75%', top: '65%' }}
              title="Singapore"
              type="button"
            >
              <div className="port-icon">🏢</div>
              <div className="port-label">Singapore</div>
              {travelingShip.location === 'singapore' && <div className="current-indicator">📍</div>}
            </button>

            {/* Traveling ship indicator */}
            <div className="traveling-ship">
              <div className="ship-icon">🚢</div>
              <div className="ship-name">{travelingShip.name}</div>
            </div>

            {/* Trade routes (optional decorative lines) */}
            <svg className="trade-routes" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <pattern height="1" id="dashed" patternUnits="userSpaceOnUse" width="4">
                  <rect fill="#4a90e2" height="1" opacity="0.3" width="2"/>
                </pattern>
              </defs>
              {/* Example trade route lines */}
              <path d="M22,35 Q40,20 48,25" fill="none" opacity="0.4" stroke="url(#dashed)" strokeWidth="0.5"/>
              <path d="M48,25 Q65,15 85,38" fill="none" opacity="0.4" stroke="url(#dashed)" strokeWidth="0.5"/>
              <path d="M85,38 Q80,50 75,65" fill="none" opacity="0.4" stroke="url(#dashed)" strokeWidth="0.5"/>
            </svg>
          </div>
          
          <button 
            className="cancel-travel-btn"
            onClick={() => {
              setShowWorldMap(false)
              setTravelingShip(null)
            }}
          >
            Cancel Travel
          </button>
        </div>
      </div>
    )
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
          <button className="dev-button" onClick={refreshCargo}>🔄 Refresh Cargo</button>
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
              {gameState.ships.map(ship => {
                const shipScale = getShipScale(ship.capacity)
                const usedCapacity = getShipCargoWeight(ship)
                const remainingCapacity = getShipRemainingCapacity(ship)
                const capacityPercentage = (usedCapacity / ship.capacity) * 100
                
                let capacityClass = 'capacity-low'
                if (capacityPercentage >= 100) capacityClass = 'capacity-full'
                else if (capacityPercentage >= 80) capacityClass = 'capacity-high'
                else if (capacityPercentage >= 50) capacityClass = 'capacity-medium'
                return (
                  <div className="ship-card" key={ship.id}>
                    <div 
                      className={`ship-preview ${ship.type}-ship`}
                      style={{ 
                        transform: `scaleX(${shipScale})`,
                        transformOrigin: 'left center'
                      }}
                    ></div>
                    <div className="ship-info">
                      <h4>{ship.name}</h4>
                      <p>Type: {ship.type} | Capacity: {ship.capacity}t</p>
                      <p className={capacityClass}>Used: {usedCapacity}t | Available: {remainingCapacity}t</p>
                      <p>Speed: {ship.speed} knots</p>
                      <p>Best for: {getBestForText(ship.type)}</p>
                      <p>Location: {getLocationDisplay(ship)}</p>
                      <p>Condition: {ship.condition}%</p>
                      {ship.cargo && ship.cargo.length > 0 && (
                        <div className="cargo-info">
                          <p><strong>Cargo:</strong></p>
                          {ship.cargo.map(cargo => (
                            <p className="cargo-item" key={cargo.id}>
                              • {cargo.type} ({cargo.weight}t) → {INITIAL_PORTS.find(p => p.id === cargo.destination)?.name || cargo.destination}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="ship-actions">
                      {!ship.location.endsWith('-docked') && (
                        <>
                          <button onClick={() => handleShipAction(ship.id, 'dock')}>
                            Dock Ship
                          </button>
                          <button 
                            disabled={gameState.money < 1000}
                            onClick={() => handleTowingService(ship.id)}
                            title="Use towing boat service ($1,000)"
                          >
                            Use Towing Service
                          </button>
                          <button 
                            disabled={gameState.money < 2000}
                            onClick={() => handleTravelToPort(ship.id)}
                            title="Travel to another port ($2,000)"
                          >
                            Travel to Port
                          </button>
                        </>
                      )}
                      <button onClick={() => handleShipAction(ship.id, 'rescue')}>
                        Rescue Mission
                      </button>
                      {ship.location.endsWith('-docked') && (
                        <>
                          <button onClick={() => handleShipAction(ship.id, 'undock')}>
                            Undock Ship
                          </button>
                          <button 
                            disabled={gameState.money < 1000}
                            onClick={() => handleUndockingTowingService(ship.id)}
                            title="Use tugboat service for undocking ($1,000)"
                          >
                            Undock with Tugboat
                          </button>
                        </>
                      )}
                      {ship.location.endsWith('-docked') && gameState.ships.length > 1 && (
                        <button 
                          className="sell-ship-btn"
                          onClick={() => sellShip(ship.id)}
                          title={`Sell for $${Math.floor(ship.cost * 0.75).toLocaleString()} (75% of original price)`}
                        >
                          Sell Ship
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="ship-market">
              <h3>Ship Market</h3>
              <div className="ship-options">
                <div className="ship-market-card">
                  <div 
                    className="ship-preview cargo-ship"
                    style={{ 
                      transform: `scaleX(${getShipScale(1000)})`,
                      transformOrigin: 'left center'
                    }}
                  ></div>
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
                  <div 
                    className="ship-preview container-ship"
                    style={{ 
                      transform: `scaleX(${getShipScale(1500)})`,
                      transformOrigin: 'left center'
                    }}
                  ></div>
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
                  <div 
                    className="ship-preview tanker-ship"
                    style={{ 
                      transform: `scaleX(${getShipScale(2000)})`,
                      transformOrigin: 'left center'
                    }}
                  ></div>
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
                const shipsAtPort = gameState.ships.filter(s => s.location === `${cargo.origin}-docked`)
                const availableShips = shipsAtPort.filter(s => canAcceptCargo(s, cargo))
                const shipsAtOrigin = gameState.ships.filter(s => s.location === cargo.origin || s.location === `${cargo.origin}-docked`)
                
                // Determine why ships aren't available
                let unavailabilityReason = ""
                if (shipsAtPort.length === 0) {
                  if (shipsAtOrigin.length === 0) {
                    unavailabilityReason = `No ships at ${origin?.name || cargo.origin}`
                  } else {
                    const dockedCount = shipsAtOrigin.filter(s => s.location === `${cargo.origin}-docked`).length
                    const sailingCount = shipsAtOrigin.filter(s => s.location === cargo.origin).length
                    if (sailingCount > 0 && dockedCount === 0) {
                      unavailabilityReason = `${sailingCount} ship${sailingCount > 1 ? 's' : ''} at ${origin?.name || cargo.origin} but not docked`
                    } else {
                      unavailabilityReason = `No suitable ships available at ${origin?.name || cargo.origin}`
                    }
                  }
                } else if (availableShips.length === 0) {
                  unavailabilityReason = `Ships at port but insufficient capacity for ${cargo.weight}t cargo`
                }
                
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
                            acceptCargo(cargo.id, e.target.value)
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
          </div>
        </div>
      ) : null}
    </div>
  )
}
