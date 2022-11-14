import { css, injectGlobal } from '@emotion/css'

export const root = css`
  label: brush-component;
`

export const variables = injectGlobal`
  :root {
    --vis-brush-selection-fill-color: #0b1640;
    --vis-brush-selection-stroke-color: #acb2b9;
    --vis-brush-handle-fill-color: #6d778c;
    --vis-brush-handle-stroke-color: #eee;

    --vis-dark-brush-selection-fill-color:#acb2b9;
    --vis-dark-brush-selection-stroke-color: #0b1640;
    --vis-dark-brush-handle-fill-color: #acb2b9;
    --vis-dark-brush-handle-stroke-color: var(--vis-color-grey);
  }

  body.theme-dark ${`.${root}`} {
    --vis-brush-selection-fill-color: var(--vis-dark-brush-selection-fill-color);
    --vis-brush-selection-stroke-color: var(--vis-dark-brush-selection-stroke-color);
    --vis-brush-handle-fill-color: var(--vis-dark-brush-handle-fill-color);
    --vis-brush-handle-stroke-color: var(--vis-dark-brush-handle-stroke-color);
  }
`

export const brush = css`
  label: brush;
  fill: none;
  stroke: none;

  .selection {
    fill: none;
    stroke: var(--vis-brush-selection-stroke-color);
    stroke-width: 0;
    stroke-opacity: 0;
  }

  .handle {
    fill: var(--vis-brush-handle-fill-color);
  }

  &.non-draggable {
    .selection, .overlay {
      pointer-events: none;
    }
  }
`

export const unselected = css`
  label: unselected;
  fill: var(--vis-brush-selection-fill-color);
  opacity: 0.4;
  pointer-events: none;
`

export const handleLine = css`
  label: handle-line;
  stroke: var(--vis-brush-handle-stroke-color);
  stroke-width: 1;
  fill: none;
  pointer-events: none;
`
