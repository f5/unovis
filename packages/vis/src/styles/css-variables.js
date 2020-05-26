// Copyright (c) Volterra, Inc. All rights reserved.
import { injectGlobal } from 'emotion'
import { colors, getCSSVarName } from './colors'

export const variables = injectGlobal`
  :root {
    label: vis-root-styles;
    --vis-font-family: "Open Sans", Arial, "Helvetica Neue", Helvetica, sans-serif;
    --vis-color-main: #34daa6;
    --vis-color-gray: #2a2a2a;
    ${colors.map((c, i) => `${getCSSVarName(i)}: ${c};`)}
  }
`
