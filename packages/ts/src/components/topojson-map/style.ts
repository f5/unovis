import { css } from '@emotion/css'
import { getCssVarNames, injectGlobalCssVariables } from 'utils/style'

const cssVarDefaults = {
  // Base map colors
  '--vis-map-feature-color': '#dce3eb',
  '--vis-map-boundary-color': '#ffffff',

  // Point label
  '--vis-map-point-label-text-color-dark': '#5b5f6d',
  '--vis-map-point-label-text-color-light': '#fff',
  '--vis-map-point-label-font-family': undefined as undefined,
  '--vis-map-point-label-font-weight': '600',
  '--vis-map-point-label-font-size': '12px',

  // Area label
  '--vis-map-area-label-text-color': '#5b5f6d',
  '--vis-map-area-label-font-weight': '600',
  '--vis-map-area-label-font-size': '12px',
  '--vis-map-area-label-font-family': undefined as undefined,

  // Bottom label
  '--vis-map-point-bottom-label-text-color': '#5b5f6d',
  '--vis-map-point-bottom-label-font-size': '10px',

  // Point styles
  '--vis-map-point-default-fill-color': '#B9BEC3',
  '--vis-map-point-ring-fill-color': '#ffffff',
  '--vis-map-point-default-stroke-color': '#959da3',
  '--vis-map-point-default-stroke-width': '0px',

  // Cluster styles
  '--vis-map-cluster-default-fill-color': '#fff',
  '--vis-map-cluster-default-stroke-color': '#B9BEC3',
  '--vis-map-cluster-default-stroke-width': '1.5px',
  '--vis-map-cluster-donut-fill-color': '#959da3',
  '--vis-map-cluster-expanded-background-fill-color': '#fff',

  // Dark theme defaults (overridable by host)
  '--vis-dark-map-feature-color': '#5b5f6d',
  '--vis-dark-map-boundary-color': '#2a2a2a',
  '--vis-dark-map-point-label-text-color-dark': '#fff',
  '--vis-dark-map-point-label-text-color-light': '#5b5f6d',
  '--vis-dark-map-area-label-text-color': '#fff',
  '--vis-dark-map-point-bottom-label-text-color': '#fff',
  '--vis-dark-map-point-default-fill-color': '#B9BEC3',
  '--vis-dark-map-point-default-stroke-color': '#959da3',
  '--vis-dark-map-point-ring-fill-color': '#5b5f6d',
  '--vis-dark-map-cluster-default-fill-color': '#5b5f6d',
  '--vis-dark-map-cluster-default-stroke-color': '#B9BEC3',
  '--vis-dark-map-cluster-donut-fill-color': '#959da3',
  '--vis-dark-map-cluster-expanded-background-fill-color': '#2a2a2a',
} as const

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

export const variables = getCssVarNames(cssVarDefaults)
injectGlobalCssVariables(cssVarDefaults, root)

export const pointPathRing = css`
  label: point-path-ring;
  fill: var(${variables.mapPointRingFillColor});
`

export const features = css`
  label: features;
`

export const feature = css`
  label: feature;
  fill: var(${variables.mapFeatureColor});
  stroke: var(${variables.mapBoundaryColor});
  stroke-opacity: 0.5;
`

export const areaLabel = css`
  label: area-label;

  text-anchor: middle;
  cursor: default;
  pointer-events: none;

  font-size: var(${variables.mapAreaLabelFontSize});
  font-family: var(${variables.mapAreaLabelFontFamily}, var(--vis-font-family));
  font-weight: var(${variables.mapAreaLabelFontWeight});
  fill: var(${variables.mapAreaLabelTextColor});
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
  transition: .3s transform;

  &:active {
    cursor: default;
  }

  &:hover {
    transform: scale(1.1);
  }
`

export const pointLabel = css`
  label: label;

  text-anchor: middle;
  cursor: default;
  pointer-events:none;

  font-size: var(${variables.mapPointLabelFontSize});
  font-family: var(${variables.mapPointLabelFontFamily}, var(--vis-font-family));
  font-weight: var(${variables.mapPointLabelFontWeight});
  fill: var(${variables.mapPointDefaultFillColor});
  stroke-width: var(${variables.mapPointDefaultStrokeWidth});
`

export const pointBottomLabel = css`
  label: point-bottom-label;

  text-anchor: middle;
  cursor: default;
  pointer-events:none;

  font-size: var(${variables.mapPointBottomLabelFontSize});
  font-family: var(${variables.mapPointLabelFontFamily}, var(--vis-font-family));
  font-weight: 600;
  fill: var(${variables.mapPointBottomLabelTextColor});
`

// Style class exported for custom CSS targeting of donut chart paths
// Can be used to apply custom styles to pie chart segments
export const pointDonut = css`
  label: point-donut;
  transition: .3s transform;

  path {
    stroke-opacity: 0.8;
  }
  
  &:hover {
    transform: scale(1.1);
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
    filter: drop-shadow(0 0 2px var(--vis-map-cluster-default-stroke-color)) drop-shadow(0 0 4px var(--vis-map-cluster-default-stroke-color));
  }
`

export const clusterBackground = css`
  label: cluster-background;
  fill: var(${variables.mapClusterDefaultFillColor});
  stroke: none;
  pointer-events: all;
`

export const pointSelectionRing = css`
  label: point-selection-ring;
  stroke: var(${variables.mapPointDefaultFillColor});
`

export const pointSelection = css`
  label: point-selection;

  opacity: 0;
  transform: scale(1);

  &.active {
    transition: all 400ms cubic-bezier(0.230, 1.000, 0.320, 1.000);
    opacity: 1;
    transform: scale(1.25);
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
