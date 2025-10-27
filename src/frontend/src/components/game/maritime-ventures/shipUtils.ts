import type { Cargo, Ship } from './types'

export const getShipCargoWeight = (ship: Ship): number => {
  return ship.cargo?.reduce((total, cargo) => total + cargo.weight, 0) || 0
}

export const getShipRemainingCapacity = (ship: Ship): number => {
  return ship.capacity - getShipCargoWeight(ship)
}

export const canAcceptCargo = (ship: Ship, cargo: Cargo): boolean => {
  return getShipRemainingCapacity(ship) >= cargo.weight
}

export const getLocationSuffix = (action: string): string => {
  switch (action) {
    case 'dock':
      return '-waiting'
    case 'undock':
      return '-undocking'
    default:
      return '-rescue'
  }
}

export const getMiniGameType = (action: string): 'docking' | 'rescue' | 'undocking' => {
  switch (action) {
    case 'dock':
      return 'docking'
    case 'undock':
      return 'undocking'
    default:
      return 'rescue'
  }
}

export const getBestForText = (shipType: Ship['type']): string => {
  switch (shipType) {
    case 'cargo':
      return 'General cargo'
    case 'container':
      return 'Containers'
    case 'tanker':
      return 'Oil & liquids'
    default:
      return 'General cargo'
  }
}

export const getShipScale = (capacity: number): number => {
  // Base scale factor - smallest ship (1000t) gets scale 1.0
  // Scale increases with capacity: 1000t=1.0, 1500t=1.25, 2000t=1.5
  const baseCapacity = 1000
  return Math.max(0.8, Math.min(1.6, capacity / baseCapacity))
}

export const getLocationDisplay = (ship: Ship, ports: Array<{ id: string; name: string }>): string => {
  const portName =
    ports.find((p) => p.id === ship.location.replace('-docked', '').replace('-waiting', '').replace('-rescue', ''))
      ?.name || 'Unknown'

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

export const getShipCapacity = (type: Ship['type']): number => {
  if (type === 'tanker') return 2000
  if (type === 'container') return 1500
  return 1000
}

export const getShipSpeed = (type: Ship['type']): number => {
  if (type === 'cargo') return 15
  if (type === 'container') return 18
  return 12
}

export const getShipCost = (type: Ship['type']): number => {
  const costs = { cargo: 50000, container: 80000, tanker: 120000 }
  return costs[type]
}
