// Copyright (c) Volterra, Inc. All rights reserved.
// Core
import { getCSSVarName } from 'styles/colors'

// Utils
import { getValue } from 'utils/data'

/** Retrieves color from data if available, fallbacks to a css variable with a specified suffix or to a null value if the suffix is not passed */
export function getColor (d: any, accessor: any, cssVarSuffix?: number | string): string {
  const value = getValue(d, accessor)
  return (value || cssVarSuffix ? `var(${getCSSVarName(cssVarSuffix)})` : null) as string
}
