import { css, injectGlobal } from '@emotion/css'

export const root = css`
  label: topojson-map-component;

  &.draggable {
    &:active {
      cursor: grabbing;
      cursor: -moz-grabbing;
      cursor: -webkit-grabbing;
    }
  }
`

export const variables = injectGlobal`
  :root {
    --vis-map-feature-color: #dce3eb;
    --vis-map-boundary-color: #ffffff;

    --vis-map-point-label-text-color-dark: #5b5f6d;
    --vis-map-point-label-text-color-light: #fff;

    // Undefined by default to allow proper fallback to var(--vis-font-family)
    /* --vis-map-point-label-font-family: */
    --vis-map-point-label-font-weight: 600;
    --vis-map-point-label-font-size: 12px;

    /* Dark Theme */
    --vis-dark-map-feature-color: #5b5f6d;
    --vis-dark-map-boundary-color: #2a2a2a;
    --vis-dark-map-point-label-text-color-dark: #fff;
    --vis-dark-map-point-label-text-color-light:#5b5f6d;
  }

  body.theme-dark ${`.${root}`} {
    --vis-map-feature-color: var(--vis-dark-map-feature-color);
    --vis-map-boundary-color: var(--vis-dark-map-boundary-color);
    --vis-map-point-label-text-color-dark: var(--vis-dark-map-point-label-text-color-dark);
    --vis-map-point-label-text-color-light: var(--vis-dark-map-point-label-text-color-light);
  }
`

export const features = css`
  label: features;
`

export const feature = css`
  label: feature;
  fill: var(--vis-map-feature-color);
  stroke: var(--vis-map-boundary-color);
  stroke-opacity: 0.5;
`

export const background = css`
  label: background;

  fill-opacity: 0;
  pointer-events: all;
`

export const points = css`
  label: points;
`

export const point = css`
  label: point;
`

export const pointShape = css`
  label: point-shape;

  stroke-opacity: 0.4;
  pointer-events: fill;

  &:active {
    cursor: default;
  }
`

export const pointLabel = css`
  label: label;

  text-anchor: middle;
  cursor: default;
  pointer-events:none;

  font-size: var(--vis-map-point-label-font-size);
  font-family: var(--vis-map-point-label-font-family, var(--vis-font-family));
  font-weight: var(--vis-map-point-label-font-weight);
  fill: var(--vis-map-point-label-text-color-dark);
`

// Style class exported for custom CSS targeting of donut chart paths
// Can be used to apply custom styles to pie chart segments
export const pointDonut = css`
  label: point-donut;

  path {
    stroke-opacity: 0.8;
  }
`

export const links = css`
  label: links;
`

export const link = css`
  label: link;

  fill: none;
  stroke-opacity: .50;
  stroke-linecap: round;

  &:hover {
    stroke-opacity: .90;
  }
`
