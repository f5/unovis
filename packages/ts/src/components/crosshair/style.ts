import { css, injectGlobal } from '@emotion/css'

export const globalStyles = injectGlobal`
  :root {
    --vis-crosshair-line-stroke-color: #888;
    --vis-crosshair-circle-stroke-color: #fff;
  }
`

export const root = css`
  label: crosshair-component;
`

export const line = css`
  stroke: var(--vis-crosshair-line-stroke-color);
  stroke-opacity: 1;
  pointer-events: none;
`

export const circle = css`
  stroke: var(--vis-crosshair-circle-stroke-color);
  stroke-width: 1;
  stroke-opacity: 0.75;
  pointer-events: none;
`
