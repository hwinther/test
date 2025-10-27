import type { Ship } from './types'
import { getLocationSuffix, getMiniGameType, getShipCapacity, getShipCost, getShipSpeed } from './shipUtils'

export function createShipActionHandlers(
  gameState: any,
  updateShip: (shipId: string, updater: (ship: Ship) => Ship) => void,
  spendMoney: (amount: number) => boolean,
  addMoney: (amount: number) => void,
  addShip: (ship: Ship) => void,
  removeShip: (shipId: string) => void,
  setSelectedShip: (ship: Ship | null) => void,
  setCurrentMiniGame: (game: 'docking' | 'rescue' | 'undocking' | null) => void,
  setTravelingShip: (ship: Ship | null) => void,
  setShowWorldMap: (show: boolean) => void,
) {
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
    handleShipAction,
    handleTowingService,
    handleTravelToPort,
    buyShip,
    sellShip,
    addDevMoney,
  }
}
