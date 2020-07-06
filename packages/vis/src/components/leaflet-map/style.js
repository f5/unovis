// Copyright (c) Volterra, Inc. All rights reserved.
import { css, injectGlobal } from 'emotion'

// Inject Leaflet global style
// eslint-disable-next-line
import leafletCSS from './leaflet.css'
injectGlobal(leafletCSS)

export const variables = injectGlobal`
  :root {
    --vis-map-background-color: #dfe5eb;
    --vis-map-cluster-donut-fill-color: #959da3;
    --vis-map-point-default-fill-color: #3aea38;
    --vis-map-point-from-cluster-stroke-color: #fff;
    --vis-map-point-cluster-fill-color: #fff;
    --vis-map-inner-label-font-family: var(--vis-font-family);
    --vis-map-inner-label-color: #7e8992;
    --vis-map-point-with-stroke-color: #fff;
    --vis-map-cluser-expanded-color-fill: #fff;

  }
`

export const mapContainer = css`
  label: map-leaflet;

  width: 100%;
  height: 100%;
  position: absolute;
  background-color: var(--vis-map-background-color);

  canvas {
    pointer-events: all;
  }
`

export const background = `${mapContainer} canvas`

export const points = css`
  label: g-points;
`

export const point = css`
  label: g-point;
`

export const pointPath = css`
  label: point-path;

  stroke-opacity: 1;
  fill-opacity: 0.85;
  fill: var(--vis-map-point-default-fill-color);
  pointer-events: fill !important;
  transition: .2s stroke-width, .3s transform;

  &.fromCluster {
    stroke: var(--vis-map-point-from-cluster-stroke-color);
  }

  &.cluster {
    fill-opacity: 0.9;
    stroke: none;
    animation: none;
    fill: var(--vis-map-point-cluster-fill-color);
  }

  &.withStroke {
    stroke-width: 1.25px;
    stroke: var(--vis-map-point-with-stroke-color);
  }

  &:hover {
    cursor: pointer;
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
    transform: scale(1.6);
  }
`

export const innerLabel = css`
  label: inner-label;

  text-anchor: middle;
  fill: var(--vis-map-inner-label-color);
  font-family: var(--vis-map-inner-label-font-family);
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

  fill: var(--vis-map-cluser-expanded-color-fill);
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
