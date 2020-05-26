// Copyright (c) Volterra, Inc. All rights reserved.
// Core
import { getCSSVarName } from 'styles/colors'

// Utils
import { getValue, isNumber } from 'utils/data'

/** Retrieves color from data if available, fallbacks to a css variable with a specified suffix or to a null value if the suffix is not passed */
export function getColor (d: any, accessor: any, index?: number): string {
  const value = getValue(d, accessor, index)
  return (value || (isNumber(index) ? `var(${getCSSVarName(index)})` : null)) as string
}

export function hexToBrightness (hex) {
  const rgb = hexToRgb(hex)
  return (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255
}

export function hexToRgb (hex) {
  const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return parsed ? {
    r: parseInt(parsed[1], 16),
    g: parseInt(parsed[2], 16),
    b: parseInt(parsed[3], 16),
  } : { r: 0, g: 0, b: 0 }
}
