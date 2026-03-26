import type { GameState, Ship } from './types'

import { getLocationSuffix, getMiniGameType, getShipCapacity, getShipCost, getShipSpeed } from './shipUtils'

interface ShipActionHandlerOptions {
  addMoney: (amount: number) => void
  addShip: (ship: Ship) => void
  gameState: GameState
  removeShip: (shipId: string) => void
  setCurrentMiniGame: (game: 'docking' | 'rescue' | 'undocking' | null) => void
  setSelectedShip: (ship: null | Ship) => void
  setShowWorldMap: (show: boolean) => void
  setTravelingShip: (ship: null | Ship) => void
  spendMoney: (amount: number) => boolean
  updateShip: (shipId: string, updater: (ship: Ship) => Ship) => void
}

/**
 * Creates ship action handlers for managing ship operations like docking, undocking, and rescue operations
 * @param {ShipActionHandlerOptions} options - Configuration options for ship action handlers
 * @returns {object} Object containing ship action handler functions
 */
export function createShipActionHandlers({
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
}: ShipActionHandlerOptions) {
  const handleShipAction = (shipId: string, action: 'dock' | 'rescue' | 'undock'): void => {
    const ship = gameState.ships.find((s: Ship) => s.id === shipId)
    if (!ship) return

    const locationSuffix = getLocationSuffix(action)
    const miniGameType = getMiniGameType(action)

    // Update ship location to show it's engaged in the action
    updateShip(shipId, (ship) => ({
      ...ship,
      location: `${ship.location}${locationSuffix}`,
    }))

    setSelectedShip(ship)
    setCurrentMiniGame(miniGameType)
  }

  const handleTowingService = (shipId: string): void => {
    const towingCost = 1000 // $1000 for towing service

    if (spendMoney(towingCost)) {
      updateShip(shipId, (ship) => ({
        ...ship,
        location: `${ship.location}-docked`,
      }))
    }
  }

  const handleTravelToPort = (shipId: string): void => {
    const ship = gameState.ships.find((s: Ship) => s.id === shipId)
    if (ship) {
      setTravelingShip(ship)
      setShowWorldMap(true)
    }
  }

  const buyShip = (shipType: Ship['type']): void => {
    const cost = getShipCost(shipType)

    if (spendMoney(cost)) {
      const newShip: Ship = {
        capacity: getShipCapacity(shipType),
        condition: 100,
        cost,
        id: `ship_${Date.now()}`,
        location: `${gameState.currentPort}-docked`,
        name: `${shipType.charAt(0).toUpperCase() + shipType.slice(1)} ${gameState.ships.length + 1}`,
        speed: getShipSpeed(shipType),
        type: shipType,
      }

      addShip(newShip)
    }
  }

  const sellShip = (shipId: string): void => {
    const ship = gameState.ships.find((s: Ship) => s.id === shipId)

    if (ship?.location.endsWith('-docked')) {
      const sellPrice = Math.floor(ship.cost * 0.75) // 75% of original price
      addMoney(sellPrice)
      removeShip(shipId)
    }
  }

  const addDevMoney = (): void => {
    addMoney(500000)
  }

  return {
    addDevMoney,
    buyShip,
    handleShipAction,
    handleTowingService,
    handleTravelToPort,
    sellShip,
  }
}
