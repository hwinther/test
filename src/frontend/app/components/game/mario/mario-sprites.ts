import type { SpriteTheme } from './mario-types'

import botvarUrl from '~/assets/botvar_liten.png'
import bugvarUrl from '~/assets/bugvar_liten.png'
import commentBubbleUrl from '~/assets/comment_bubble.png'
import piranhaParliamentUrl from '~/assets/piranha_parliament.png'

export interface SpriteSet {
  goomba: HTMLImageElement | null
  koopa: HTMLImageElement | null
  piranha: HTMLImageElement | null
  player: HTMLImageElement | null
}

const classicSprites: SpriteSet = { goomba: null, koopa: null, piranha: null, player: null }
let botvarSprites: SpriteSet | undefined

const botvarUrls = {
  goomba: commentBubbleUrl,
  koopa: bugvarUrl,
  piranha: piranhaParliamentUrl,
  player: botvarUrl,
} satisfies Record<keyof SpriteSet, string>

/**
 * Lazily load each mascot asset and expose it as soon as the image is available.
 * @param {SpriteTheme} theme - Active game art theme
 * @returns {SpriteSet} Sprite images or null entries while pending
 */
export function getSprites(theme: SpriteTheme): SpriteSet {
  if (theme === 'classic') return classicSprites
  if (botvarSprites) return botvarSprites

  const sprites = { ...classicSprites }
  for (const name of Object.keys(botvarUrls) as (keyof SpriteSet)[]) {
    const image = new Image()
    image.addEventListener('load', () => {
      sprites[name] = image
    })
    image.src = botvarUrls[name]
  }
  botvarSprites = sprites
  return sprites
}
