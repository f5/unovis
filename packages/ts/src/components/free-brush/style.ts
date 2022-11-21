import { css, injectGlobal } from '@emotion/css'

export const root = css`
  label: free-brush-component;
`

export const variables = injectGlobal`
  :root {
    --vis-free-brush-selection-fill-color: #0b1640;
    --vis-free-brush-selection-fill-opacity: 0.4;
    --vis-free-brush-selection-stroke-color: #acb2b9;
    --vis-free-brush-handle-fill-color: #6d778c;
    --vis-free-brush-handle-stroke-color: none;

    --vis-dark-free-brush-selection-fill-color: #344174;
    --vis-dark-free-brush-selection-stroke-color: #0b1640;
    --vis-dark-free-brush-handle-fill-color: #6d778c;
  }

  body.theme-dark ${`.${root}`} {
    --vis-free-brush-selection-fill-color: var(--vis-dark-free-brush-selection-fill-color);
    --vis-free-brush-selection-stroke-color: var(--vis-dark-free-brush-selection-stroke-color);
    --vis-free-brush-handle-fill-color: var(--vis-dark-free-brush-selection-fill-color);
  }
`

export const brush = css`
  label: brush;
  fill: none;
  stroke: none;

  .selection {
    fill: var(--vis-free-brush-selection-fill-color);
    fill-opacity: var(--vis-free-brush-selection-fill-opacity);
    stroke: var(--vis-free-brush-selection-stroke-color);
    stroke-width: 0;
    stroke-opacity: 0;
  }

  .handle {
    fill: var(--vis-free-brush-handle-fill-color);
    stroke: var(--vis-free-brush-handle-stroke-color);
  }
`

export const hide = css`
  .selection, .handle {
    display: none;
  }
`
