import { css, injectGlobal } from '@emotion/css'


export const globalStyles = injectGlobal`
  :root {
    --vis-plotband-color: rgba(255, 255, 90, 0.2);

    --vis-dark-plotband-color: rgba(220, 220, 90, 0.2);
  }

  body.theme-dark {
    --vis-plotband-color: var(--vis-dark-plotband-color);
  }
`

export const root = css`
  label: plotband-component;
`

export const plotband = css`
  label: plotband;
  transition: opacity 200ms;
  cursor: var(--vis-line-cursor);
  fill: var(--vis-plotband-color);
`

export const plotbandPath = css`
  label: plotbandPath;
  fill: none;
`
