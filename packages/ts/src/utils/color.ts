import { color } from 'd3-color'

// Core
import { getCSSColorVariable } from 'styles/colors'

// Utils
import { ColorAccessor, StringAccessor } from 'types/accessor'
import { getString, isNumber } from 'utils/data'
import { isStringCSSVariable, getCSSVariableValue } from 'utils/misc'

type RGBColor = { r: number; g: number; b: number }

/** Retrieves color from the data if provided, fallbacks to CSS variables if the index was passed */
export function getColor<T> (
  d: T,
  accessor: ColorAccessor<T>,
  index?: number,
  dontFallbackToCssVar?: boolean
): string | null {
  if (Array.isArray(accessor) && isFinite(index)) return accessor[index % accessor.length]

  const value = getString(d, accessor as StringAccessor<T>, index)
  return (value || ((isNumber(index) && !dontFallbackToCssVar) ? `var(${getCSSColorVariable(index)})` : null))
}

export function hexToRgb (hex: string): RGBColor {
  const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return parsed ? {
    r: parseInt(parsed[1], 16),
    g: parseInt(parsed[2], 16),
    b: parseInt(parsed[3], 16),
  } : { r: 0, g: 0, b: 0 }
}

export function rgbToBrightness (rgb: RGBColor): number {
  return (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255
}

export function hexToBrightness (hex: string): number {
  const rgb = hexToRgb(hex)
  return rgbToBrightness(rgb)
}

export function getHexValue (s: string, context: HTMLElement | SVGElement): string {
  const hex = isStringCSSVariable(s) ? getCSSVariableValue(s, context) : s
  return color(hex)?.formatHex()
}

export function rgbaToRgb (rgba: string, backgroundColor?: string): RGBColor {
  const rgb = color(rgba)?.rgb()
  if (!rgb || rgb.opacity === 1) return rgb
  const alpha = 1 - rgb.opacity
  const bg = color(backgroundColor ?? '#fff').rgb()
  return {
    r: Math.round((rgb.opacity * (rgb.r / 255) + (alpha * (bg.r / 255))) * 255),
    g: Math.round((rgb.opacity * (rgb.g / 255) + (alpha * (bg.g / 255))) * 255),
    b: Math.round((rgb.opacity * (rgb.b / 255) + (alpha * (bg.b / 255))) * 255),
  }
}
