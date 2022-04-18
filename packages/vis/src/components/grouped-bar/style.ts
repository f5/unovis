import { css, injectGlobal } from '@emotion/css'

export const global = injectGlobal`
  :root {
    --vis-grouped-bar-cursor: default;
    --vis-grouped-bar-fill: var(--vis-color-main);
    --vis-grouped-bar-stroke: none;
    --vis-grouped-bar-stroke-width: 0px;
    --vis-grouped-bar-hover-stroke-width: 1px;
    --vis-grouped-bar-hover-stroke: none;
  }
`

export const root = css`
  label: grouped-bar-component;
`

export const bar = css`
  label: bar;
  fill: var(--vis-grouped-bar-fill);
  stroke: var(--vis-grouped-bar-stroke);
  stroke-width: var(--vis-grouped-bar-stroke-width);
  cursor: var(--vis-grouped-bar-cursor);

  &:hover {
    stroke-width: var(--vis-grouped-bar-hover-stroke-width);
    stroke: var(--vis-grouped-bar-hover-stroke);
  }
`

export const barGroup = css`
  label: barGroup;
`

export const barGroupExit = css`
  label: barGroupExit;
`
