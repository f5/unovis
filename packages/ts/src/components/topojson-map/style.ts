import { css, injectGlobal } from '@emotion/css'
export const pointPathRing = css`
  label: point-path-ring;
  fill: var(--vis-map-point-ring-fill-color);
`

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

    --vis-map-area-label-text-color: #5b5f6d;
    --vis-map-area-label-font-weight: 600;
    --vis-map-area-label-font-size: 12px;

    --vis-map-point-default-fill-color: #B9BEC3;
    --vis-map-point-ring-fill-color: #ffffff;
    --vis-map-point-default-stroke-color: #959da3;
    --vis-map-point-default-stroke-width: 0px;

    --vis-map-cluster-default-fill-color: #fff;
    --vis-map-cluster-default-stroke-color: #B9BEC3;
    --vis-map-cluster-default-stroke-width: 1.5px;
    --vis-map-cluster-donut-fill-color: #959da3;

    /* Dark Theme */
    --vis-dark-map-feature-color: #5b5f6d;
    --vis-dark-map-boundary-color: #2a2a2a;
    --vis-dark-map-point-label-text-color-dark: #fff;
    --vis-dark-map-point-label-text-color-light:#5b5f6d;
    --vis-dark-map-area-label-text-color: #fff;
    --vis-dark-map-point-default-fill-color: #B9BEC3;
    --vis-dark-map-point-default-stroke-color: #959da3;
    --vis-dark-map-point-ring-fill-color: #5b5f6d;
    --vis-dark-map-cluster-default-fill-color: #5b5f6d;
    --vis-dark-map-cluster-default-stroke-color: #B9BEC3;
    --vis-dark-map-cluster-donut-fill-color: #959da3;
  }

  body.theme-dark ${`.${root}`} {
    --vis-map-feature-color: var(--vis-dark-map-feature-color);
    --vis-map-boundary-color: var(--vis-dark-map-boundary-color);
    --vis-map-point-label-text-color-dark: var(--vis-dark-map-point-label-text-color-dark);
    --vis-map-point-label-text-color-light: var(--vis-dark-map-point-label-text-color-light);
    --vis-map-area-label-text-color: var(--vis-dark-map-area-label-text-color);
    --vis-map-point-default-fill-color: var(--vis-dark-map-point-default-fill-color);
    --vis-map-point-default-stroke-color: var(--vis-dark-map-point-default-stroke-color);
    --vis-map-point-ring-fill-color: var(--vis-dark-map-point-ring-fill-color);
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

export const areaLabel = css`
  label: area-label;

  text-anchor: middle;
  cursor: default;
  pointer-events: none;

  font-size: var(--vis-map-area-label-font-size);
  font-family: var(--vis-map-area-label-font-family, var(--vis-font-family));
  font-weight: var(--vis-map-area-label-font-weight);
  fill: var(--vis-map-area-label-text-color);
`

export const background = css`
  label: background;

  fill-opacity: 0;
  pointer-events: all;
`

export const points = css`
  label: points;
`

export const clusterBackgroundCircle = css`
  label: cluster-background-circle;
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
  fill: var(--vis-map-point-default-fill-color);
  stroke-width: var(--vis-map-point-default-stroke-width);
`

export const pointBottomLabel = css`
  label: point-bottom-label;

  text-anchor: middle;
  cursor: default;
  pointer-events:none;

  font-size: var(--vis-map-point-bottom-label-font-size, 10px);
  font-family: var(--vis-map-point-label-font-family, var(--vis-font-family));
  font-weight: 600;
  fill: var(--vis-map-point-bottom-label-text-color, #5b5f6d);
`

// Style class exported for custom CSS targeting of donut chart paths
// Can be used to apply custom styles to pie chart segments
export const pointDonut = css`
  label: point-donut;

  path {
    stroke-opacity: 0.8;
  }
`

export const clusterDonut = css`
  label: cluster-donut;
  transform: scale(1);
  transition: .3s transform;

  path {
    stroke-opacity: 0.8;
  }

  &:hover {
    transform: scale(1.1);
    
    path {
      stroke: white;
      stroke-width: 2;
    }
  }
`

export const clusterBackground = css`
  label: cluster-background;
  fill: var(--vis-map-cluster-default-fill-color);
  stroke: none;
  pointer-events: all;
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

export const flowParticles = css`
  label: flow-particles;
`

export const flowParticle = css`
  label: flow-particle;
  
  pointer-events: none;
`

export const sourcePoints = css`
  label: source-points;
`

export const sourcePoint = css`
  label: source-point;
  
  cursor: pointer;
  stroke-opacity: 0.8;
  
  &:hover {
    stroke-opacity: 1;
  }
`
