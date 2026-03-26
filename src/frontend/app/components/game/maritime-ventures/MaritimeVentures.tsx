
import { type JSX, useEffect, useState } from 'react'

import type { Port, Ship } from './types'

import { AvailableCargo } from './AvailableCargo'
import { DockingGame } from './DockingGame'
import { RescueGame } from './RescueGame'
import { createShipActionHandlers } from './shipActionHandlers'
import { ShipMarket } from './ShipMarket'
import { canAcceptCargo, getBestForText, getLocationDisplay, getShipCargoWeight, getShipRemainingCapacity, getShipScale } from './shipUtils'
import UndockingGame from './UndockingGame'
import { useCargoManagement } from './useCargoManagement'
import { useGameState } from './useGameState'
import { WorldMap } from './WorldMap'
import './MaritimeVentures.css'

const INITIAL_PORTS: Port[] = [
  { country: 'USA', difficulty: 1, dockingFee: 500, id: 'ny', name: 'New York' },
  { country: 'UK', difficulty: 2, dockingFee: 800, id: 'london', name: 'London' },
  { country: 'Japan', difficulty: 3, dockingFee: 1200, id: 'tokyo', name: 'Tokyo' },
  { country: 'Germany', difficulty: 2, dockingFee: 700, id: 'hamburg', name: 'Hamburg' },
  { country: 'Singapore', difficulty: 4, dockingFee: 1500, id: 'singapore', name: 'Singapore' }
]

interface MaritimeVenturesProps {
  readonly onClose?: () => void
}

/**
 * Main game component for the Maritime Ventures Easter egg
 * @param {MaritimeVenturesProps} props - Component properties
 * @returns {JSX.Element} The game interface
 */
export function MaritimeVentures({ onClose }: MaritimeVenturesProps): JSX.Element {
  // Game state management
  const {
    addMoney,
    addShip,
    completeJobs,
    gameState,
    incrementGameTime,
    removeShip,
    spendMoney,
    updateReputation,
    updateShip
  } = useGameState()

  // Cargo management
  const { availableCargo, refreshCargo, removeCargo } = useCargoManagement()

  // UI state
  const [selectedShip, setSelectedShip] = useState<null | Ship>(null)
  const [currentMiniGame, setCurrentMiniGame] = useState<'docking' | 'rescue' | 'undocking' | null>(null)
  const [gameActive, setGameActive] = useState(true)
  const [showWorldMap, setShowWorldMap] = useState(false)
  const [travelingShip, setTravelingShip] = useState<null | Ship>(null)

  // Ship action handlers
  const {
    addDevMoney,
    buyShip,
    handleShipAction,
    handleTowingService,
    handleTravelToPort,
    sellShip
  } = createShipActionHandlers({
    addMoney,
    addShip,
    gameState,
    removeShip,
    setCurrentMiniGame,
    setSelectedShip,
    setShowWorldMap,
    setTravelingShip,
    spendMoney,
    updateShip,
  })

  // Port selection handler for world map
  const handlePortSelection = (portId: string): void => {
    if (!travelingShip) return
    
    const travelCost = 2000
    if (!spendMoney(travelCost)) return
    
    const deliverableCargo = travelingShip.cargo?.filter(cargo => cargo.destination === portId) || []
    const remainingCargo = travelingShip.cargo?.filter(cargo => cargo.destination !== portId) || []
    
    const deliveryEarnings = deliverableCargo.reduce((total, cargo) => total + cargo.value, 0)
    const dockingFee = INITIAL_PORTS.find(p => p.id === portId)?.dockingFee || 0
    
    addMoney(deliveryEarnings - dockingFee)
    completeJobs(deliverableCargo.length)
    updateShip(travelingShip.id, ship => ({
      ...ship,
      cargo: remainingCargo,
      location: portId
    }))
    
    setShowWorldMap(false)
    setTravelingShip(null)
  }

  // Cargo acceptance handler
  const acceptCargo = (cargoId: string, shipId: string): void => {
    const cargo = availableCargo.find(c => c.id === cargoId)
    const ship = gameState.ships.find(s => s.id === shipId)

    if (!cargo || !ship || ship.location !== `${cargo.origin}-docked`) return
    if (!canAcceptCargo(ship, cargo)) {
      alert(`Cannot accept cargo: Ship capacity exceeded.`)
      return
    }

    updateShip(shipId, ship => ({
      ...ship,
      cargo: [...(ship.cargo || []), cargo]
    }))
    
    removeCargo(cargoId)
  }

  // Mini-game completion handler
  const handleMiniGameComplete = (success: boolean, bonus: number, penalty: number = 0): void => {
    if (success && selectedShip) {
      addMoney(bonus)
      updateReputation(2)
    }

    if (penalty > 0) {
      spendMoney(penalty)
      updateReputation(-5)
    }

    // Update ship location based on mini-game type and success
    if (selectedShip) {
      updateShip(selectedShip.id, ship => {
        const baseLocation = ship.location.replace('-waiting', '').replace('-undocking', '').replace('-rescue', '')
        
        if (currentMiniGame === 'docking') {
          return { ...ship, location: success ? `${baseLocation}-docked` : baseLocation }
        } else if (currentMiniGame === 'undocking') {
          return { ...ship, location: success ? baseLocation : `${baseLocation}-docked` }
        }
        
        return { ...ship, location: baseLocation }
      })
    }
    
    setCurrentMiniGame(null)
    setSelectedShip(null)
  }

  const handleUndockingTowingService = (shipId: string): void => {
    if (spendMoney(1000)) {
      updateShip(shipId, ship => ({
        ...ship,
        location: ship.location.replace('-docked', '')
      }))
    }
  }

  // Initialize game data and timer
  useEffect(() => {
    refreshCargo()
    
    const timer = setInterval(() => {
      incrementGameTime()
    }, 5000) // 1 game day = 5 seconds

    return () => clearInterval(timer)
  }, [refreshCargo, incrementGameTime])

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
      <WorldMap
        gameState={gameState}
        onClose={() => {
          setShowWorldMap(false)
          setTravelingShip(null)
        }}
        onPortSelection={handlePortSelection}
        travelingShip={travelingShip}
      />
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
                      <p>Location: {getLocationDisplay(ship, INITIAL_PORTS)}</p>
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

            <ShipMarket
              gameState={gameState}
              onBuyShip={buyShip}
            />
          </div>

          <div className="right-panel">
            <AvailableCargo
              availableCargo={availableCargo}
              gameState={gameState}
              onAcceptCargo={acceptCargo}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
