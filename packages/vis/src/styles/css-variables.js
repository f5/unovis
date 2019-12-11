// Copyright (c) Volterra, Inc. All rights reserved.
import { injectGlobal } from 'emotion'

export const variables = injectGlobal`
  :root {
    label: vis-root-styles;
    --vis-font: Open Sans, Arial, Helvetica Neue, Helvetica, sans-serif;
    --vis-color-main: #34daa6;
  }
`
