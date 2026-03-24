/** Identifiers for short Web Audio cues used by the Mario clone. */
export type MarioSoundId = 'coin' | 'damage' | 'fire' | 'flag' | 'jump' | 'powerup' | 'stomp'

let audioCtx: AudioContext | null = null

/**
 * Play a one-shot synthesized sound effect (lazy `AudioContext` creation).
 * @param {MarioSoundId} id - Which in-game event to represent
 * @returns {void}
 */
export function playMarioSound(id: MarioSoundId): void {
  switch (id) {
    case 'coin':
      beep(988, 0.06, 'square', 0.06)
      setTimeout(() => beep(1319, 0.08, 'square', 0.05), 40)
      break
    case 'damage':
      beep(150, 0.2, 'sawtooth', 0.07)
      break
    case 'fire':
      beep(440, 0.05, 'square', 0.05)
      beep(220, 0.08, 'square', 0.04)
      break
    case 'flag':
      beep(523, 0.1, 'square', 0.06)
      setTimeout(() => beep(659, 0.12, 'square', 0.06), 90)
      break
    case 'jump':
      beep(330, 0.05, 'square', 0.05)
      break
    case 'powerup':
      beep(523, 0.08, 'square', 0.07)
      setTimeout(() => beep(784, 0.1, 'square', 0.07), 70)
      setTimeout(() => beep(1047, 0.12, 'square', 0.06), 160)
      break
    case 'stomp':
      beep(200, 0.07, 'square', 0.08)
      break
    default:
      break
  }
}

/**
 * Play a short oscillator tone through the shared audio context.
 * @param {number} freq - Frequency in Hz
 * @param {number} duration - Length in seconds
 * @param {OscillatorType} [type] - Oscillator waveform
 * @param {number} [gain] - Linear gain (approximate loudness)
 * @returns {void}
 */
function beep(freq: number, duration: number, type: OscillatorType = 'square', gain = 0.08): void {
  const ctx = getCtx()
  if (!ctx) return
  if (ctx.state === 'suspended') {
    void ctx.resume()
  }
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.value = gain
  osc.connect(g)
  g.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + duration)
}

/**
 * Lazily create and return the shared `AudioContext`, or `null` if unsupported.
 * @returns {AudioContext | null} Shared context instance, or `null` when Web Audio is unavailable
 */
function getCtx(): AudioContext | null {
  if (typeof globalThis.AudioContext === 'undefined') return null
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  return audioCtx
}
