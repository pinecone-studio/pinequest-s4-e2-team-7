import type { ImageSourcePropType } from 'react-native'

export type Ad = {
  id: string
  image: ImageSourcePropType
  /** Card background shown behind the image (for transparent/contained images). */
  bg?: string
  /** 'cover' for full-bleed banner creatives, 'contain' for logos. Default 'cover'. */
  resizeMode?: 'cover' | 'contain'
  /** Optional link opened when the banner is tapped. */
  url?: string
}

// Ad creatives live in apps/mobile/assets/ads/. require() paths must be static literals.
/* eslint-disable @typescript-eslint/no-require-imports -- RN bundles image assets via static require() */
export const ADS: Ad[] = [
  { id: 'ad-1', image: require('../assets/ads/1.png') },
  { id: 'ad-2', image: require('../assets/ads/2.png') },
  { id: 'ad-3', image: require('../assets/ads/3.png') },
]
/* eslint-enable @typescript-eslint/no-require-imports */
