// Core
import { getCSSColorVariable } from 'styles/colors'

// Utils
import { getString, isNumber } from 'utils/data'
import { ColorAccessor, StringAccessor } from 'types/accessor'

/** Retrieves color from the data if provided, fallbacks to CSS variables if the index was passed */
export function getColor<T> (d: T, accessor: ColorAccessor<T>, index?: number, dontFallbackToCssVar?: boolean): string {
  if (Array.isArray(accessor) && isFinite(index)) return accessor[index % accessor.length]

  const value = getString(d, accessor as StringAccessor<T>, index)
  return (value || ((isNumber(index) && !dontFallbackToCssVar) ? `var(${getCSSColorVariable(index)})` : null)) as string
}

export function hexToRgb (hex: string): { r: number; g: number; b: number } {
  const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return parsed ? {
    r: parseInt(parsed[1], 16),
    g: parseInt(parsed[2], 16),
    b: parseInt(parsed[3], 16),
  } : { r: 0, g: 0, b: 0 }
}

export function hexToBrightness (hex: string): number {
  const rgb = hexToRgb(hex)
  return (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255
}
