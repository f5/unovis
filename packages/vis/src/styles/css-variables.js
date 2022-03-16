// Copyright (c) Volterra, Inc. All rights reserved.
import { injectGlobal } from '@emotion/css'
import { colors, getCSSColorVariable } from './colors'

export const variables = injectGlobal`
  :root {
    label: vis-root-styles;
    --vis-font-family: Inter, Arial, "Helvetica Neue", Helvetica, sans-serif;
    --vis-color-main: var(${getCSSColorVariable(0)});
    --vis-color-gray: #2a2a2a;
    ${colors.map((c, i) => `${getCSSColorVariable(i)}: ${c};`)}
  }
`
