import type { SpriteTheme } from './mario-types'

import botvarUrl from '~/assets/botvar_liten.png'
import bugvarUrl from '~/assets/bugvar_liten.png'
import commentBubbleUrl from '~/assets/comment_bubble.png'
import piranhaParliamentUrl from '~/assets/piranha_parliament.png'

export interface SpriteSet {
  goomba: HTMLImageElement | null
  koopa: HTMLImageElement | null
  piranha: HTMLImageElement | null
  loaded: boolean
  player: HTMLImageElement | null
}

const cache = new Map<SpriteTheme, SpriteSet>()

/**
 * Create an `HTMLImageElement` from a Vite-resolved asset URL.
 * @param {string} src - Image URL
 * @returns {HTMLImageElement} Image element with `src` set
 */
function loadImage(src: string): HTMLImageElement {
  const img = new Image()
  img.src = src
  return img
}

/**
 * Return the sprite set for a given theme, loading images on first call.
 * Images load asynchronously; callers should check `sprite.loaded` or
 * fall back to the default canvas drawing when images are not yet ready.
 * @param {SpriteTheme} theme - The visual theme to load sprites for
 * @returns {SpriteSet} Sprite images (may still be loading)
 */
export function getSprites(theme: SpriteTheme): SpriteSet {
  if (theme === 'classic') {
    return { goomba: null, koopa: null, piranha: null, loaded: true, player: null }
  }

  const existing = cache.get(theme)
  if (existing) return existing

  const set: SpriteSet = { goomba: null, koopa: null, piranha: null, loaded: false, player: null }

  if (theme === 'botvar') {
    const playerImg = loadImage(botvarUrl)
    const goombaImg = loadImage(commentBubbleUrl)
    const koopaImg = loadImage(bugvarUrl)
    const piranhaImg = loadImage(piranhaParliamentUrl)

    let loadedCount = 0
    const onLoad = (): void => {
      loadedCount++
      if (loadedCount === 4) {
        set.player = playerImg
        set.goomba = goombaImg
        set.koopa = koopaImg
        set.piranha = piranhaImg
        set.loaded = true
      }
    }

    playerImg.addEventListener('load', onLoad)
    goombaImg.addEventListener('load', onLoad)
    koopaImg.addEventListener('load', onLoad)
    piranhaImg.addEventListener('load', onLoad)
    playerImg.addEventListener('error', () => {
      set.loaded = true
    })
    goombaImg.addEventListener('error', () => {
      set.loaded = true
    })
    koopaImg.addEventListener('error', () => {
      set.loaded = true
    })
    piranhaImg.addEventListener('error', () => {
      set.loaded = true
    })
  }

  cache.set(theme, set)
  return set
}
