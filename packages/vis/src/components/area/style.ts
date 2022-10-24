import { css, injectGlobal } from '@emotion/css'


export const root = css`
  label: area-component;
`

export const globalStyles = injectGlobal`
  :root {
    --vis-area-cursor: default;
    --vis-area-fill-opacity: 1;
    --vis-area-stroke: var(--vis-color-main);
    --vis-area-stroke-width: 0px;
    --vis-area-stroke-dasharray: none;
    --vis-area-stroke-opacity: 1;
    --vis-area-hover-fill-opacity: none;
    --vis-area-hover-stroke-width: none;

    --vis-dark-area-stroke: var(--vis-color-main);

  }

  body.theme-dark ${`.${root}`} {
   --vis-area-stroke: var(--vis-dark-area-stroke);
  }

`
export const area = css`
  label: area;
  cursor: var(--vis-area-cursor);
  fill-opacity: var(--vis-area-fill-opacity);
  stroke-width: var(--vis-area-stroke-width);
  stroke-dasharray: var(--vis-area-stroke-dasharray);
  stroke: var(--vis-area-stroke);
  stroke-opacity: var(--vis-area-stroke-opacity);

  &:hover {
    fill-opacity: var(--vis-area-hover-fill-opacity);
    stroke-width: var(--vis-area-hover-stroke-width);
  }
`
