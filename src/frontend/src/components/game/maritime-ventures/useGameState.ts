import { useCallback, useState } from 'react'
import type { GameState, Ship } from './types'

const INITIAL_SHIPS = [
  {
    capacity: 1000,
    condition: 85,
    cost: 50000,
    id: 'ship1',
    location: 'ny-docked',
    name: 'SS Starter',
    speed: 12,
    type: 'cargo' as const,
  },
]

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>({
    completedJobs: 0,
    currentPort: 'ny',
    gameTime: 0,
    money: 25000,
    reputation: 50,
    ships: INITIAL_SHIPS,
  })

  const updateGameState = useCallback((updater: (prev: GameState) => GameState) => {
    setGameState(updater)
  }, [])

  const addMoney = useCallback((amount: number) => {
    setGameState((prev) => ({
      ...prev,
      money: prev.money + amount,
    }))
  }, [])

  const spendMoney = useCallback(
    (amount: number): boolean => {
      if (gameState.money >= amount) {
        setGameState((prev) => ({
          ...prev,
          money: prev.money - amount,
        }))
        return true
      }
      return false
    },
    [gameState.money],
  )

  const updateShip = useCallback((shipId: string, updater: (ship: Ship) => Ship) => {
    setGameState((prev) => ({
      ...prev,
      ships: prev.ships.map((ship) => (ship.id === shipId ? updater(ship) : ship)),
    }))
  }, [])

  const addShip = useCallback((ship: Ship) => {
    setGameState((prev) => ({
      ...prev,
      ships: [...prev.ships, ship],
    }))
  }, [])

  const removeShip = useCallback((shipId: string) => {
    setGameState((prev) => ({
      ...prev,
      ships: prev.ships.filter((ship) => ship.id !== shipId),
    }))
  }, [])

  const completeJobs = useCallback((count: number) => {
    setGameState((prev) => ({
      ...prev,
      completedJobs: prev.completedJobs + count,
    }))
  }, [])

  const updateReputation = useCallback((amount: number) => {
    setGameState((prev) => ({
      ...prev,
      reputation: Math.max(0, Math.min(100, prev.reputation + amount)),
    }))
  }, [])

  const incrementGameTime = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      gameTime: prev.gameTime + 1,
    }))
  }, [])

  return {
    gameState,
    updateGameState,
    addMoney,
    spendMoney,
    updateShip,
    addShip,
    removeShip,
    completeJobs,
    updateReputation,
    incrementGameTime,
  }
}
