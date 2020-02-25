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
