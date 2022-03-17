// Copyright (c) Volterra, Inc. All rights reserved.
import { css, injectGlobal } from '@emotion/css'

// Inject Leaflet global style
// eslint-disable-next-line
import leafletCSS from './leaflet.css'
injectGlobal(leafletCSS)


export const root = css`
  label: leaflet-map-component;

  width: 100%;
  height: 100%;
  position: absolute;
  background-color: var(--vis-map-container-background-color);

  canvas {
    pointer-events: all;
  }
`

export const variables = injectGlobal`
  :root {
    --vis-map-container-background-color: #dfe5eb;
    --vis-map-label-font-family: var(--vis-font-family);

    --vis-map-point-default-fill-color: #B9BEC3;
    --vis-map-point-default-stroke-color: #959da3;
    --vis-map-point-default-stroke-width: 0px;
    --vis-map-point-default-cursor: default;

    --vis-map-cluster-default-fill-color: #fff;
    --vis-map-cluster-default-stroke-color: #B9BEC3;
    --vis-map-cluster-default-stroke-width: 1.5px;
    --vis-map-cluster-donut-fill-color: #959da3;

    --vis-map-point-label-text-color-dark: #5b5f6d;
    --vis-map-point-label-text-color-light: #fff;

    --vis-map-cluster-expanded-background-fill: #fff;

    --vis-dark-map-container-background-color: #dfe5eb;
    --vis-dark-map-point-default-fill-color: #B9BEC3;
    --vis-dark-map-point-default-stroke-color: #959da3;
  
    --vis-dark-map-cluster-default-fill-color: #5b5f6d;
    --vis-dark-map-cluster-default-stroke-color: #B9BEC3;
    --vis-dark-map-cluster-donut-fill-color: #959da3;

    --vis-dark-map-point-label-text-color-dark: #fff;
    --vis-dark-map-point-label-text-color-light: #fff;
  
    --vis-dark-map-cluster-expanded-background-fill: #fff;
  }

  body.theme-dark .${root} {
    --vis-map-container-background-color: var(--vis-dark-map-container-background-color);
    --vis-map-point-default-fill-color: var(--vis-dark-map-point-default-fill-color);
    --vis-map-point-default-stroke-color: var(--vis-dark-map-point-default-stroke-color);

    --vis-map-cluster-default-fill-color: var(--vis-dark-map-cluster-default-fill-color);
    --vis-map-cluster-default-stroke-color: var(--vis-dark-map-cluster-default-stroke-color);
    --vis-map-cluster-donut-fill-color: var(--vis-dark-map-cluster-donut-fill-color);

    --vis-map-point-label-text-color-dark: var(--vis-dark-map-point-label-text-color-dark);
    --vis-map-point-label-text-color-light: var(--vis-dark-map-point-label-text-color-light);
    --vis-map-cluster-expanded-background-fill: var(--vis-dark-map-cluster-expanded-background-fill);
    }
  }
`

export const background = `${root} canvas`

export const points = css`
  label: g-points;
`

export const point = css`
  label: g-point;
`

export const pointPath = css`
  label: point-path;

  stroke-opacity: 1;
  fill-opacity: 1.0;
  fill: var(--vis-map-point-default-fill-color);
  stroke: var(--vis-map-point-default-stroke-color);
  stroke-width: var(--vis-map-point-default-stroke-width);
  pointer-events: fill !important;
  transition: .2s stroke-width, .3s transform;
  cursor: var(--vis-map-point-default-cursor);

  &.cluster {
    fill-opacity: 0.9;
    stroke: none;
    animation: none;
    fill: var(--vis-map-cluster-default-fill-color);
    stroke: var(--vis-map-cluster-default-stroke-color);
    stroke-width: var(--vis-map-cluster-default-stroke-width);
  }

  &:hover {
    stroke-width: 2;
    fill-opacity: 1;
    animation: none;
    transform: scale(1.1);
  }
`

export const pointSelectionRing = css`
  label: point-selection-ring;

  stroke: var(--vis-map-point-default-fill-color);
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

export const innerLabel = css`
  label: inner-label;

  text-anchor: middle;
  fill: var(--vis-map-point-label-text-color-dark);
  font-family: var(--vis-map-label-font-family);
  pointer-events: none;
  font-weight: 600;
`

export const bottomLabel = css`
  label: bottom-label;

  text-anchor: middle;
  fill: var(--vis-map-point-label-text-color-dark);
  font-family: var(--vis-map-label-font-family);
  pointer-events: none;
  font-weight: 600;
`

export const donutCluster = css`
  label: donut-cluster;

  transform: scale(1);
  transition: .3s transform;
  path {
    fill: var(--vis-map-cluster-donut-fill-color);
    stroke-width: 0.5;
  }

  &:hover {
    transform: scale(1.1);
  }
`

export const svgOverlay = css`
  label: svg-overlay;
  position: absolute;
  pointer-events: none;
`

export const backgroundRect = css`
  label: background-rect;

  opacity: 0;
`

export const clusterBackground = css`
  label: cluster-background;

  fill: var(--vis-map-cluster-expanded-background-fill);
  opacity: 0.6;
  visibility: hidden;

  &.active {
    visibility: visible;
  }
`

export const onFeatureHover = css``

export const mapboxglCanvas = css`
  pointer-events: all;
  cursor: grab;

  &${`.${onFeatureHover}`} {
    cursor: default;
  }
`
