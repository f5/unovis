import type { GradientStop } from '@/types/gradient'

export const GRADIENT_DEFAULT_STOPS: GradientStop[] = [
  { offset: 0, opacity: 1 },
  { offset: 1, opacity: 0.4 },
]

export const GRADIENT_AREA_DEFAULT_STOPS: GradientStop[] = [
  { offset: 0, opacity: 0.5 },
  { offset: 1, opacity: 0.1 },
]

export const GRADIENT_BAR_DEFAULT_STOPS: GradientStop[] = [
  { offset: 0, opacity: 0.85 },
  { offset: 1, opacity: 0.5 },
]

export const GRADIENT_FUNNEL_DEFAULT_STOPS: GradientStop[] = [
  { offset: 0, opacity: 0.5 },
  { offset: 1, opacity: 0.15 },
]

export const GRADIENT_TIMELINE_DEFAULT_STOPS: GradientStop[] = [
  { offset: 0, opacity: 0.95 },
  { offset: 1, opacity: 0.6 },
]

export const GRADIENT_TREEMAP_DEFAULT_STOPS: GradientStop[] = [
  { offset: 0, opacity: 0.95 },
  { offset: 1, opacity: 0.9, colorShift: 0.2 },
]

export const GRADIENT_SANKEY_NODE_DEFAULT_STOPS: GradientStop[] = [
  { offset: 0, opacity: 1 },
  { offset: 1, opacity: 0.75 },
]

/** From the inner edge of each Donut, NestedDonut, or RadialBar ring to its outer edge */
export const GRADIENT_RADIAL_DEFAULT_STOPS: GradientStop[] = [
  { offset: 0, opacity: 0.5 },
  { offset: 1, opacity: 1 },
]

/** Class of the scoped `<defs>` element that holds the generated gradients */
export const GRADIENT_DEFS_CLASS = 'unovis-gradient-defs'

/** Prefix of the generated gradient ids. Ids carry no digits, so d3 never tweens a `url(#...)` fill */
export const GRADIENT_ID_PREFIX = 'vis-gradient'

/** Maps each hash nibble (0-f) to a letter (g-v) */
export const GRADIENT_ID_ALPHABET = 'ghijklmnopqrstuv'
