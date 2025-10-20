import { css } from '@emotion/css'

// Utils
import { getCssVarNames, injectGlobalCssVariables } from 'utils/style'

const cssVarDefaults = {
  '--vis-treemap-tile-stroke-color': '#fff',
  '--vis-treemap-tile-stroke-width': '2px',
  '--vis-treemap-tile-hover-stroke-color': '#fff',
  '--vis-treemap-tile-hover-stroke-opacity': 0,
  '--vis-treemap-tile-fill-color': '#B9BEC3',
  '--vis-treemap-tile-background-color': '#fff',
  '--vis-treemap-tile-cursor': 'default',
  '--vis-treemap-label-text-color': '#000',
  '--vis-treemap-label-text-color-light': '#fff',
  '--vis-treemap-label-font-size': '12px',

  /* Label opacity */
  '--vis-treemap-label-opacity': 0.8,
  '--vis-treemap-label-font-weight': 'normal',

  /* Dark Theme */
  '--vis-dark-treemap-tile-stroke-color': '#2c2c2c',
  '--vis-dark-treemap-tile-fill-color': '#5b5f6d',
  '--vis-dark-treemap-label-text-color': '#5b5f6d',
}

export const root = css`
  label: treemap-component;
`

export const variables = getCssVarNames(cssVarDefaults)
injectGlobalCssVariables(cssVarDefaults, root)

export const tiles = css`
  label: g-tiles;
`

export const tileGroup = css`
  label: tile-group;
`

export const tile = css`
  label: tile;
  stroke: var(${variables.treemapTileHoverStrokeColor});
  stroke-opacity: 0;

  &:hover {
    stroke-opacity: var(--vis-treemap-tile-hover-stroke-opacity);
  }
`

// The leaf tiles are clickable
export const clickableTile = css`
  label: clickable-tile;
  cursor: pointer;
`

export const tileForeground = css`
  label: tile-foreground;
`

export const label = css`
  label: label;
  text-anchor: start;
  dominant-baseline: hanging;
  user-select: none;
  pointer-events: none;
  font-size: var(--vis-treemap-label-font-size);
  opacity: var(--vis-treemap-label-opacity);
  fill: var(--vis-treemap-label-text-color);
  font-weight: var(--vis-treemap-label-font-weight);
`

export const internalLabel = css`
  font-weight: 500;
`

export const labelGroup = css`
  label: label-group;
`
