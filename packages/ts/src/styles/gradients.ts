// Types
import { GradientStop } from '@/types/gradient'

export const GRADIENT_DEFAULT_STOPS: GradientStop[] = [
  { offset: 0, opacity: 1 },
  { offset: 1, opacity: 0.4 },
]

/** Default stops of the radial components (Donut, NestedDonut, RadialBar): from the inner edge of the ring to the outer one */
export const GRADIENT_RADIAL_DEFAULT_STOPS: GradientStop[] = [
  { offset: 0, opacity: 0.5 },
  { offset: 1, opacity: 1 },
]

/** Class of the container-owned `<defs>` element that holds the generated gradients */
export const GRADIENT_DEFS_CLASS = 'unovis-gradient-defs'

/** Prefix of the generated gradient ids. Ids carry no digits, so d3 never tweens a `url(#...)` fill */
export const GRADIENT_ID_PREFIX = 'vis-gradient'

/** Maps each hash nibble (0-f) to a letter (g-v) */
export const GRADIENT_ID_ALPHABET = 'ghijklmnopqrstuv'
