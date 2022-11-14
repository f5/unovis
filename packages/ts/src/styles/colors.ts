import { isNumber } from 'utils/data'

/** Array of default colors */
export const colors = globalThis?.UNOVIS_COLORS || ['#6A9DFF', '#a611a5', '#1acb9a', '#8777d9', '#f88080', '#5242aa', '#8ee422']

/** Return a CSS Variable name for a given color index or string */
export const getCSSColorVariable = (suffix: string | number): string => {
  return `--vis-${isNumber(suffix) ? `color${(suffix as number) % colors.length}` : suffix}`
}
