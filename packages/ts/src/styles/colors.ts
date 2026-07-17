import { hsl } from 'd3-color'
import { isNumber } from '@/utils/data'

/** Array of default colors */
export const colors = globalThis?.UNOVIS_COLORS || ['#4D8CFD', '#FF6B7E', '#F4B83E', '#A6CC74', '#00C19A', '#6859BE']
export const colorsDark = globalThis?.UNOVIS_COLORS_DARK || ['#4D8CFD', '#FF6B7E', '#FFC16D', '#A6CC74', '#00C19A', '#7887E0']

/** Return a CSS Variable name for a given color index or string */
export const getCSSColorVariable = (suffix: string | number): string => {
  return `--vis-${isNumber(suffix) ? `color${(suffix as number) % colors.length}` : suffix}`
}

export function getLighterColor (hex: string, percentage = 0.4): string {
  const c = hsl(hex)
  c.l = c.l * (1 + percentage)
  return c.formatHex()
}

export function getDarkerColor (
  hex: string,
  percentageL = 0.4,
  percentageS = 0.6
): string {
  const c = hsl(hex)
  c.s = c.s * (1 - percentageS)
  c.l = c.l * (1 - percentageL)
  return c.formatHex()
}
