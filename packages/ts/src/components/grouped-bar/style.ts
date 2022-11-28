import { css, injectGlobal } from '@emotion/css'

export const root = css`
  label: grouped-bar-component;
`

export const globalStyles = injectGlobal`
  :root {
    --vis-grouped-bar-cursor: default;
    --vis-grouped-bar-fill-color: var(--vis-color-main);
    --vis-grouped-bar-stroke-color: none;
    --vis-grouped-bar-stroke-width: 0px;
    --vis-grouped-bar-hover-stroke-width: 1px;
    --vis-grouped-bar-hover-stroke-color: none;


    /* Dark Theme */
    --vis-dark-grouped-bar-stroke-color: none;
  }

  body.theme-dark ${`.${root}`} {
    --vis-grouped-bar-stroke-color: var(--vis-dark-grouped-bar-stroke-color);
  }
`

export const bar = css`
  label: bar;
  fill: var(--vis-grouped-bar-fill-color);
  stroke: var(--vis-grouped-bar-stroke-color);
  stroke-width: var(--vis-grouped-bar-stroke-width);
  cursor: var(--vis-grouped-bar-cursor);

  &:hover {
    stroke-width: var(--vis-grouped-bar-hover-stroke-width);
    stroke: var(--vis-grouped-bar-hover-stroke-color);
  }
`

export const barGroup = css`
  label: barGroup;
`

export const barGroupExit = css`
  label: barGroupExit;
`
