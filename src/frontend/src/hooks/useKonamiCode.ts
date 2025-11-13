import { useEffect, useState } from 'react'

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
]

/**
 * Hook to detect the Konami code input sequence
 * @returns {boolean} True if the Konami code has been activated
 */
export function useKonamiCode(): boolean {
  const [isActivated, setIsActivated] = useState(false)

  const checkSequence = (newSequence: string[]): boolean => {
    return newSequence.every((key, index) => key === KONAMI_CODE[index])
  }

  useEffect(() => {
    let keySequence: string[] = []

    const handleKeyDown = (event: KeyboardEvent) => {
      keySequence = [...keySequence, event.code]

      // Keep only the last 10 keys
      if (keySequence.length > KONAMI_CODE.length) {
        keySequence.shift()
      }

      // Check if the sequence matches the Konami code
      if (keySequence.length === KONAMI_CODE.length) {
        const matches = checkSequence(keySequence)
        if (matches && !isActivated) {
          setIsActivated(true)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isActivated])

  return isActivated
}
