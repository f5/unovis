// Copyright (c) Volterra, Inc. All rights reserved.
import { css, injectGlobal } from 'emotion'

export const global = injectGlobal`
  :root {
    --vis-line-cursor: default;
    --vis-line-stroke: var(--vis-color-main);
  }
`

export const line = css`
  label: line;
  fill: none;
  stroke: var(--vis-line-stroke);
  cursor: var(--vis-line-cursor);

  &:hover {
  }
`
