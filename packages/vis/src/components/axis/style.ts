import { css, injectGlobal } from '@emotion/css'

export const root = css`
  label: axis-component;
`

export const global = injectGlobal`
  :root {
    --vis-axis-font-family: var(--vis-font-family);
    --vis-axis-tick-color: #e8e9ef;
    --vis-axis-tick-label-color: #6c778c;
    --vis-axis-grid-color: #e8e9ef;
    --vis-axis-label-color: #6c778c;
    --vis-axis-tick-label-font-size: 12px;
    --vis-axis-label-font-size: 14px;

    --vis-dark-axis-tick-color: #6c778c;
    --vis-dark-axis-tick-label-color: #e8e9ef;
    --vis-dark-axis-grid-color: #6c778c;
    --vis-dark-axis-label-color:#fefefe;
  }

  body.theme-dark ${`.${root}`} {
    --vis-axis-tick-color: var(--vis-dark-axis-tick-color);
    --vis-axis-tick-label-color: var(--vis-dark-axis-tick-label-color);
    --vis-axis-grid-color: var(--vis-dark-axis-grid-color);
    --vis-axis-label-color: var(--vis-dark-axis-label-color);
  }
`

export const hideTickLine = css`
  label: hide-tick-line;
`

export const hideDomain = css`
  label: hide-domain;
`

export const axis = css`
  label: axis;

  user-select: none;

  .domain {
    stroke: var(--vis-axis-tick-color);
  }

  &${`.${hideTickLine}`} {
    .tick > line {
      opacity: 0;
    }
  }

  &${`.${hideDomain}`} {
    .domain {
      opacity: 0;
    }
  }
`

export const grid = css`
  label: grid;

  .domain {
    opacity: 0;
  }

  line {
    stroke: var(--vis-axis-grid-color);
  }
`

export const tick = css`
  label: tick;

  stroke: none;
  font-size: var(--vis-axis-tick-label-font-size);

  line {
    stroke: var(--vis-axis-tick-color);
  }

  text, tspan {
    fill: var(--vis-axis-tick-label-color);
    font-family: var(--vis-axis-font-family);
    stroke: none;
  }
`

export const label = css`
  label: label;
  fill: var(--vis-axis-label-color);
  font-size: var(--vis-axis-label-font-size);
  font-family: var(--vis-axis-font-family);
  text-anchor: middle;
`

export const tickText = css`
  label: tick-text;
`
