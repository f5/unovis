import { css, injectGlobal } from '@emotion/css'

export const root = css`
  label: axis-component;
`

export const globalStyles = injectGlobal`
  :root {
    // Undefined by default to allow proper fallback to var(--vis-font-family)
    /* --vis-axis-font-family: */
    --vis-axis-tick-color: #e8e9ef;
    /* --vis-axis-domain-color: // Undefined by default to allow fallback to var(--vis-axis-tick-color) */
    --vis-axis-grid-color: #e8e9ef;
    --vis-axis-label-color: #6c778c;
    --vis-axis-tick-label-color: #6c778c;
    --vis-axis-tick-label-font-size: 12px;
    --vis-axis-tick-label-cursor: default;
    --vis-axis-tick-label-text-decoration: none;
    --vis-axis-label-font-size: 14px;
    --vis-axis-tick-line-width: 1px;
    --vis-axis-tick-label-hide-transition: opacity 400ms ease-in-out;
    --vis-axis-grid-line-width: 1px;
    /* --vis-axis-domain-line-width: // Undefined by default to allow fallback to var(--vis-axis-grid-line-width) */

    /* Customizable line settings with backwards-compatible defaults */
    --vis-axis-domain-linecap: butt;
    --vis-axis-domain-linejoin: miter;
    --vis-axis-domain-opacity: 1;
    --vis-axis-domain-dashoffset: 0;
    --vis-axis-domain-miterlimit: 4;
    --vis-axis-domain-transition: stroke 200ms;

    --vis-dark-axis-tick-color: #6c778c;
    /* --vis-dark-axis-domain-color: // Undefined by default to allow fallback to var(--vis-dark-axis-tick-color) */
    --vis-dark-axis-tick-label-color: #e8e9ef;
    --vis-dark-axis-grid-color: #6c778c;
    --vis-dark-axis-label-color: #fefefe;
  }

  body.theme-dark ${`.${root}`} {
    --vis-axis-tick-color: var(--vis-dark-axis-tick-color);
    --vis-axis-domain-color: var(--vis-dark-axis-domain-color);
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
    stroke: var(--vis-axis-domain-color, var(--vis-axis-tick-color));
    stroke-width: var(--vis-axis-domain-line-width, var(--vis-axis-grid-line-width));
    stroke-dasharray: var(--vis-axis-domain-dasharray, 0 0);
    stroke-linecap: var(--vis-axis-domain-linecap, butt);
    stroke-linejoin: var(--vis-axis-domain-linejoin, miter);
    stroke-opacity: var(--vis-axis-domain-opacity, 1);
    stroke-dashoffset: var(--vis-axis-domain-dashoffset, 0);
    stroke-miterlimit: var(--vis-axis-domain-miterlimit, 4);
    transition: var(--vis-axis-domain-transition, stroke 200ms);
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
    stroke-width: var(--vis-axis-grid-line-width);
    stroke-dasharray: var(--vis-axis-domain-dasharray, 0 0);
    stroke-linecap: var(--vis-axis-domain-linecap, butt);
    stroke-linejoin: var(--vis-axis-domain-linejoin, miter);
    stroke-opacity: var(--vis-axis-domain-opacity, 1);
    stroke-dashoffset: var(--vis-axis-domain-dashoffset, 0);
    stroke-miterlimit: var(--vis-axis-domain-miterlimit, 4);
    transition: var(--vis-axis-domain-transition, stroke 200ms);
  }
`

export const tick = css`
  label: tick;

  stroke: none;
  font-size: var(--vis-axis-tick-label-font-size);

  line {
    stroke: var(--vis-axis-tick-color);
    stroke-width: var(--vis-axis-tick-line-width);
    stroke-dasharray: var(--vis-axis-domain-dasharray, 0 0);
    stroke-linecap: var(--vis-axis-domain-linecap, butt);
    stroke-linejoin: var(--vis-axis-domain-linejoin, miter);
    stroke-opacity: var(--vis-axis-domain-opacity, 1);
    stroke-dashoffset: var(--vis-axis-domain-dashoffset, 0);
    stroke-miterlimit: var(--vis-axis-domain-miterlimit, 4);
    transition: var(--vis-axis-domain-transition, stroke 200ms);
  }

  text {
    fill: var(--vis-axis-tick-label-color);
    cursor: var(--vis-axis-tick-label-cursor);
    font-family: var(--vis-axis-font-family, var(--vis-font-family));
    text-decoration: var(--vis-axis-tick-label-text-decoration);
    stroke: none;
  }
`

export const label = css`
  label: label;
  fill: var(--vis-axis-label-color);
  font-size: var(--vis-axis-label-font-size);
  font-family: var(--vis-axis-font-family, var(--vis-font-family));
  text-anchor: middle;
`

export const tickLabel = css`
  label: tick-label;
`

export const tickLabelHideable = css`
  label: tick-label-hideable;
  opacity: 0;
  transition: var(--vis-axis-tick-label-hide-transition);
`
