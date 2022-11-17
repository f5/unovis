import { css, injectGlobal } from '@emotion/css'

export const root = css`
  label: stacked-bar-component;
`

export const globalStyles = injectGlobal`
  :root {
    --vis-stacked-bar-cursor: default;
    --vis-stacked-bar-fill-color: var(--vis-color-main);
    --vis-stacked-bar-stroke-color: none;
    --vis-stacked-bar-stroke-width: 0px;
    --vis-stacked-bar-hover-stroke-width: none;
    --vis-stacked-bar-hover-stroke-color: none;

    /* Dark Theme */
    --vis-dark-stacked-bar-stroke-color: none;
  }

  body.theme-dark ${`.${root}`} {
    --vis-stacked-bar-stroke-color: var(--vis-dark-stacked-bar-stroke-color);
  }
`

export const bar = css`
  label: bar;
  fill: var(--vis-stacked-bar-fill);
  stroke: var(--vis-stacked-bar-stroke-color);
  stroke-width: var(--vis-stacked-bar-stroke-width);
  cursor: var(--vis-stacked-bar-cursor);

  &:hover {
    stroke-width: var(--vis-stacked-bar-hover-stroke-width);
    stroke: var(--vis-stacked-bar-hover-stroke-color);
  }
`

export const barGroup = css`
  label: barGroup;
`

export const barGroupExit = css`
  label: barGroupExit;
`
