// Copyright (c) Volterra, Inc. All rights reserved.
import { injectGlobal } from 'emotion'
import { colors, getCSSVarName } from './colors'

export const variables = injectGlobal`
  :root {
    label: vis-root-styles;
    --vis-font: Open Sans, Arial, Helvetica Neue, Helvetica, sans-serif;
    --vis-color-main: #34daa6;
    ${colors.map((c, i) => `${getCSSVarName(i)}: ${c};`)}
  }
`
