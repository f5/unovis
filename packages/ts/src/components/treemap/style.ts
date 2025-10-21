import { css } from '@emotion/css'

// Utils
import { getCssVarNames, injectGlobalCssVariables } from 'utils/style'

const cssVarDefaults = {
  '--vis-treemap-tile-stroke-color': '#fff',
  '--vis-treemap-tile-stroke-width': '2px',
  '--vis-treemap-tile-hover-stroke-color': '#fff',
  '--vis-treemap-tile-hover-stroke-opacity': 0,

  /* Labels */
  '--vis-treemap-label-opacity': 0.8,
  '--vis-treemap-label-font-weight': 'normal',
  '--vis-treemap-label-text-color': '#000',
  '--vis-treemap-label-text-color-light': '#fff',
  '--vis-treemap-label-font-size': '12px',
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
    stroke-opacity: var(${variables.treemapTileHoverStrokeOpacity})
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
  font-size: var(${variables.treemapLabelFontSize});
  opacity: var(${variables.treemapLabelOpacity});
  fill: var(${variables.treemapLabelTextColor});
  font-weight: var(${variables.treemapLabelFontWeight});
`

export const internalLabel = css`
  label: internal-label;
  font-weight: 500;
`

export const labelGroup = css`
  label: label-group;
`
