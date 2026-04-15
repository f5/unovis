import { color, hcl } from 'd3-color'
import { scaleOrdinal } from 'd3-scale'

// Core
import { colors, getCSSColorVariable } from 'styles/colors'

// Utils
import { ColorAccessor, ColorFunction } from 'types/accessor'
import { isFunction, isNumber } from 'utils/data'
import { isStringCSSVariable, getCSSVariableValue } from 'utils/misc'

type RGBColor = { r: number; g: number; b: number }

// Default color scale that uses CSS variables for the colors
// The scale is available to the users to override the default colors and domain.
export const UnovisColorScale = scaleOrdinal<string | number, string>()
  .range(Array.from({ length: colors.length }, (_, i) => `var(${getCSSColorVariable(i)})`))
  .domain(Array.from({ length: colors.length }, (_, i) => i))

/** Retrieves color from the data if provided; fallbacks to CSS variables if the index was passed */
export function getColor<T> (
  d: T,
  accessorOrValue: ColorAccessor<T>,
  index?: number,
  key?: string,
  options?: {
    dontFallbackToCssVar?: boolean;
    colorFn?: ColorFunction;
  }
): string | null {
  // If accessor is an array and index is provided, return the value at the index
  if (Array.isArray(accessorOrValue) && isFinite(index)) return accessorOrValue[index % accessorOrValue.length]

  // If accessor is a function, call it and return the result
  let value: string | null | undefined
  if (isFunction(accessorOrValue)) {
    value = accessorOrValue(d, index, key) as (string | null | undefined)
  } else {
    value = accessorOrValue as string | null | undefined
  }
  if (value) return value

  // If key is provided, return the color for the key
  const colorScale = options?.colorFn ?? UnovisColorScale
  if (key) {
    return colorScale(key as string)
  }

  // If index is a number and `dontFallbackToCssVar` is `false`, return the color for the index
  if (isNumber(index) && !options?.dontFallbackToCssVar) return colorScale(index % colors.length)

  // If all else fails, return null
  return null
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

/**
 * Makes a color brighter by a certain amount
 * @param inputColor - The color to brighten (hex, rgb, or rgba)
 * @param amount - Amount to brighten by (0-1)
 * @returns The brightened color in hex format
 */
export function brighter (inputColor: string, amount: number): string {
  const c = hcl(inputColor)
  if (!c) return inputColor
  return c.brighter(amount).formatHex()
}

export function isColorDark (color: string, threshold = 0.55): boolean {
  const hex = getHexValue(color, document.body)
  if (!hex) return false
  return hexToBrightness(hex) < threshold
}
