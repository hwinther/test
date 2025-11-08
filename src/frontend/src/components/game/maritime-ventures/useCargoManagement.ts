import { useCallback, useState } from 'react'

import type { Cargo } from './types'

const INITIAL_PORTS = [
  { country: 'USA', difficulty: 1, dockingFee: 500, id: 'ny', name: 'New York' },
  { country: 'UK', difficulty: 2, dockingFee: 800, id: 'london', name: 'London' },
  { country: 'Japan', difficulty: 3, dockingFee: 1200, id: 'tokyo', name: 'Tokyo' },
  { country: 'Germany', difficulty: 2, dockingFee: 700, id: 'hamburg', name: 'Hamburg' },
  { country: 'Singapore', difficulty: 4, dockingFee: 1500, id: 'singapore', name: 'Singapore' },
]

const CARGO_TYPES = ['Electronics', 'Textiles', 'Machinery', 'Food', 'Oil', 'Containers']

/**
 * Custom hook for managing cargo generation and operations in the maritime ventures game
 * @returns {object} Object containing cargo management functions and state
 */
export function useCargoManagement() {
  const [availableCargo, setAvailableCargo] = useState<Cargo[]>([])

  const generateCargo = useCallback((): Cargo[] => {
    const cargo: Cargo[] = []
    // eslint-disable-next-line sonarjs/pseudo-random -- Safe for game mechanics
    const numberOfJobs = Math.floor(Math.random() * 5) + 3

    for (let i = 0; i < numberOfJobs; i++) {
      // eslint-disable-next-line sonarjs/pseudo-random -- Safe for game mechanics
      const origin = INITIAL_PORTS[Math.floor(Math.random() * INITIAL_PORTS.length)]
      // eslint-disable-next-line sonarjs/pseudo-random -- Safe for game mechanics
      let destination = INITIAL_PORTS[Math.floor(Math.random() * INITIAL_PORTS.length)]

      while (destination.id === origin.id) {
        // eslint-disable-next-line sonarjs/pseudo-random -- Safe for game mechanics
        destination = INITIAL_PORTS[Math.floor(Math.random() * INITIAL_PORTS.length)]
      }

      // eslint-disable-next-line sonarjs/pseudo-random -- Safe for game mechanics
      const cargoType = CARGO_TYPES[Math.floor(Math.random() * CARGO_TYPES.length)]
      // eslint-disable-next-line sonarjs/pseudo-random -- Safe for game mechanics
      const weight = Math.floor(Math.random() * 800) + 200
      // eslint-disable-next-line sonarjs/pseudo-random -- Safe for game mechanics
      const distance = Math.floor(Math.random() * 20) + 5
      const baseValue = weight * (2 + destination.difficulty)

      cargo.push({
        destination: destination.id,
        id: `cargo_${i}_${Date.now()}`,
        origin: origin.id,
        penalty: Math.floor(baseValue * 0.3),
        // eslint-disable-next-line sonarjs/pseudo-random -- Safe for game mechanics
        timeLimit: distance + Math.floor(Math.random() * 10),
        type: cargoType,
        value: baseValue,
        weight,
      })
    }

    return cargo
  }, [])

  const refreshCargo = useCallback(() => {
    setAvailableCargo(generateCargo())
  }, [generateCargo])

  const removeCargo = useCallback((cargoId: string) => {
    setAvailableCargo((prev) => prev.filter((c) => c.id !== cargoId))
  }, [])

  return {
    availableCargo,
    generateCargo,
    refreshCargo,
    removeCargo,
    setAvailableCargo,
  }
}
