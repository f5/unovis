import { css } from '@emotion/css'

// Utils
import { getCssVarNames, injectGlobalCssVariables } from 'utils/style'

const cssVarDefaults = {
  '--vis-treemap-tile-stroke-color': '#fff',
  '--vis-treemap-tile-stroke-width': '2px',
  '--vis-treemap-tile-hover-stroke-color': '#fff',
  '--vis-treemap-tile-fill-color': '#B9BEC3',
  '--vis-treemap-tile-background-color': '#fff',
  '--vis-treemap-tile-cursor': 'default',
  /* Undefined by default to allow proper fallback to var(--vis-font-family) */
  '--vis-treemap-label-font-family': undefined as undefined,
  '--vis-treemap-label-text-color': '#5b5f6d',
  '--vis-treemap-label-font-size': '12px',

  /* Label opacity */
  '--vis-treemap-label-opacity': 0.8,

  /* Dark Theme */
  '--vis-dark-treemap-tile-stroke-color': '#2c2c2c',
  '--vis-dark-treemap-tile-fill-color': '#5b5f6d',
  '--vis-dark-treemap-label-text-color': '#fff',
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
  stroke: var(--vis-treemap-tile-hover-stroke-color);
  stroke-opacity: 0;
  transition: stroke-opacity 100ms ease-in-out;

  &:hover {
    stroke-opacity: 1;
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
`
