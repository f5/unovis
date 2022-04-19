import { css, injectGlobal } from '@emotion/css'

export const global = injectGlobal`
  :root {
    --vis-line-cursor: default;
    --vis-line-stroke-dasharray: none;
    --vis-line-stroke-dashoffset: 0;
  }
`

export const root = css`
  label: line-component;
`

export const line = css`
  label: line;
  transition: opacity 200ms;
  cursor: var(--vis-line-cursor);
`

export const linePath = css`
  label: linePath;
  fill: none;
  stroke-dasharray: var(--vis-line-stroke-dasharray);
  stroke-dashoffset: var(--vis-line-stroke-dashoffset);
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
