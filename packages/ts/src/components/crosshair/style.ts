import { css, injectGlobal } from '@emotion/css'

export const globalStyles = injectGlobal`
  :root {
    --vis-crosshair-line-stroke-color: #888;
    --vis-crosshair-line-stroke-width: 1px;
    --vis-crosshair-circle-stroke-color: #fff;
    --vis-crosshair-circle-stroke-width: 1px;
  }
`

export const root = css`
  label: crosshair-component;
`

export const line = css`
  stroke: var(--vis-crosshair-line-stroke-color);
  stroke-width: var(--vis-crosshair-line-stroke-width);
  stroke-opacity: 1;
  pointer-events: none;
`

export const circle = css`
  stroke: var(--vis-crosshair-circle-stroke-color);
  stroke-width: var(--vis-crosshair-circle-stroke-width);
  stroke-opacity: 0.75;
  pointer-events: none;
`
