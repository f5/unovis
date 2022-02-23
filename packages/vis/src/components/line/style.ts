// Copyright (c) Volterra, Inc. All rights reserved.
import { css, injectGlobal } from '@emotion/css'

export const global = injectGlobal`
  :root {
    --vis-line-cursor: default;
    --vis-line-stroke: var(--vis-color-main);
  }
`

export const root = css`
  label: line-component;
`

export const line = css`
  label: line;
  transition: opacity 200ms;
`

export const linePath = css`
  label: linePath;
  fill: none;
  stroke: var(--vis-line-stroke);
  cursor: var(--vis-line-cursor);
`

export const lineSelectionHelper = css`
  label: lineSelectionHelper;
  fill: none;
  stroke: rgba(0, 0, 0, 0);
  stroke-width: 8px;
`

export const dim = css`
  opacity: 0.2;
`
