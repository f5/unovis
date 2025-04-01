import { css, injectGlobal } from '@emotion/css'

export const root = css`
  display: flex;
`

export const rectsContainer = css`
  display: flex;
  margin: 0 var(--vis-rolling-pin-legend-spacing);
`

export const label = css`
  font-size: var(--vis-rolling-pin-legend-label-font-size);
  max-width: var(--vis-rolling-pin-legend-label-max-width);
  color: var(--vis-rolling-pin-legend-label-color);
`

export const rect = css`
  display: inline-block;
  flex: 1;
  width: var(--vis-rolling-pin-legend-item-width);
`

export const variables = injectGlobal`
  :root {
    // Undefined by default to allow proper fallback to var(--vis-font-family)
    /* --vis-legend-font-family: */

    --vis-rolling-pin-legend-label-color: #6c778c;
    --vis-rolling-pin-legend-label-max-width: 300px;
    --vis-rolling-pin-legend-label-font-size: 12px;
    --vis-rolling-pin-legend-spacing: 4px;
    --vis-rolling-pin-legend-item-width: 8px;

    --vis-dark-rolling-pin-legend-label-color: #eee;
  }

  body.theme-dark ${`.${root}`} {
    --vis-rolling-pin-legend-label-color: var(--vis-dark-rolling-pin-legend-label-color);
  }
`
