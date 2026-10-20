import { css, injectGlobal } from '@/styles/emotion'

export const globalStyles = injectGlobal`
  :root {
    --vis-line-cursor: default;
    --vis-line-stroke-dasharray: none;
    --vis-line-stroke-dashoffset: 0;

    --vis-line-gapfill-stroke-dasharray: 2 3;
    --vis-line-gapfill-stroke-opacity: 0.8;
    --vis-line-gapfill-stroke-dashoffset: 0;
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

/** Carries the line pattern's marker when `markerSpacing` thins them out. It has no stroke of its own,
 * but needs a stroke *color* because the markers are filled with `context-stroke` */
export const markerPath = css`
  label: markerPath;
  fill: none;
  stroke-width: 0;
`

export const dim = css`
  opacity: 0.2;
`

export const interpolatedPath = css`
  label: interpolated-path;
  fill: none;
  stroke-dasharray: var(--vis-line-gapfill-stroke-dasharray);
  stroke-dashoffset: var(--vis-line-gapfill-stroke-dashoffset);
  stroke-opacity: var(--vis-line-gapfill-stroke-opacity);
`
