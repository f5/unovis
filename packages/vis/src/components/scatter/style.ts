import { css, injectGlobal } from '@emotion/css'

export const global = injectGlobal`
  :root {
    --vis-scatter-cursor: default;
    --vis-scatter-fill: var(--vis-color-main);
    --vis-scatter-stroke: var(--vis-color-main);
    --vis-scatter-stroke-width: 0px;
    --vis-scatter-fill-opacity: 1;
    --vis-scatter-stroke-opacity: 1;
    --vis-scatter-hover-stroke-width: 2px;

    --vis-scatter-point-label-text-color-dark: #5b5f6d;
    --vis-scatter-point-label-text-color-light: #fff;
    --vis-scatter-point-label-text-font-weight: 500;
  }
`

export const root = css`
  label: scatter-component;
`

export const pointGroup = css`
  label: point-group;
`

export const pointGroupExit = css`
  label: point-group-exit;
`

export const point = css`
  label: point;

  > path, text {
    cursor: var(--vis-scatter-cursor);
    fill: var(--vis-scatter-fill);
    fill-opacity: var(--vis-scatter-fill-opacity);
    stroke-opacity: var(--vis-scatter-stroke-opacity);
  }

  > text {
    font-weight: var(--vis-scatter-point-label-text-font-weight);
    user-select: none;
  }

  > path {
    stroke-width: var(--vis-scatter-stroke-width);
    stroke: var(--vis-scatter-stroke);

    &:hover {
        stroke-width: var(--vis-scatter-hover-stroke-width);
    }
  }
`
