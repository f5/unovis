// Copyright (c) Volterra, Inc. All rights reserved.
// Core
import { getCSSVarName } from 'styles/colors'

// Utils
import { getValue } from 'utils/data'

export function getColor (d: any, accessor: any, index = 0): string {
  const value = getValue(d, accessor)
  return (value || `var(${getCSSVarName(index)})`) as string
}
