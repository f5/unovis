import { css, injectGlobal } from '@emotion/css'

export const globalStyles = injectGlobal`
  :root {
    --vis-xy-label-cursor: default;
    --vis-xy-label-fill-color: var(--vis-color-main);
    --vis-xy-label-stroke-color: var(--vis-color-main);
    --vis-xy-label-stroke-width: 0px;
    --vis-xy-label-fill-opacity: 1;
    --vis-xy-label-stroke-opacity: 1;
    --vis-xy-label-hover-stroke-width: 2px;

    --vis-xy-label-text-color-dark: #5b5f6d;
    --vis-xy-label-text-color-light: #fff;
    --vis-xy-label-text-font-weight: 500;
  }
`

export const root = css`
  label: xy-labels-component;
`

export const labelGroup = css`
  label: label-g;

  > rect, text {
    cursor: var(--vis-xy-label-cursor);
    fill: var(--vis-xy-label-fill);
    fill-opacity: var(--vis-xy-label-fill-opacity);
    stroke-opacity: var(--vis-xy-label-stroke-opacity);
  }

  > text {
    font-weight: var(--vis-xy-label-text-font-weight);
    user-select: none;
  }

  > rect {
    stroke-width: var(--vis-xy-label-stroke-width);
    stroke: var(--vis-xy-label-stroke-color);

    &:hover {
        stroke-width: var(--vis-xy-label-hover-stroke-width);
    }
  }
`

export const cluster = css`
  label: cluster;
`

export const label = css`
  label: label;
`
