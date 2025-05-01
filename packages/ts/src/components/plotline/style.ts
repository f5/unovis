import { css, injectGlobal } from '@emotion/css'

export const globalStyles = injectGlobal`
  :root {
    --vis-plotline-color: rgb(226, 32, 58);
    --vis-plotline-width: 2;
    --vis-plotline-dasharray: none;
    --vis-plotline-stroke-dashoffset: 0;
    --vis-plotline-font-size: 12px;
  }
`

export const root = css`
  label: plotline-component;
`

export const plotline = css`
  label: plotline;
  transition: opacity 200ms;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke: var(--vis-plotline-color);
  stroke-width: var(--vis-plotline-width);
  stroke-dasharray: var(--vis-plotline-dasharray);
  stroke-dashoffset: var(--vis-plotline-stroke-dashoffset);
`

export const label = css`
  label: plotline-label;
  text-anchor: middle;
  dominant-baseline: middle;
  pointer-events: none;
  font-size: var(--vis-plotline-font-size);
`
