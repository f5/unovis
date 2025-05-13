import { css, injectGlobal } from '@emotion/css'


export const globalStyles = injectGlobal`
  :root {
    --vis-plotband-color: rgba(255, 255, 90, 0.2);
    --vis-plotband-label-font-size: 12px;
    --vis-plotband-label-color: #000;

    --vis-dark-plotband-color: rgba(220, 220, 90, 0.2);
    --vis-dark-plotband-label-color: #e5e9f7;
  }

  body.theme-dark {
    --vis-plotband-color: var(--vis-dark-plotband-color);
    --vis-plotband-label-color: var(--vis-dark-tooltip-text-color);
  }
`

export const root = css`
  label: plotband-component;
`

export const plotband = css`
  label: plotband-area;
  transition: opacity 200ms;
  cursor: var(--vis-line-cursor);
  fill: var(--vis-plotband-color);
`

export const label = css`
  label: plotline-label;
  text-anchor: middle;
  pointer-events: none;
  font-size: var(--vis-plotline-label-font-size);
  fill: var(--vis-plotline-label-color);
`
