import { css } from '@emotion/css'
import { getCssVarNames, injectGlobalCssVariables } from '@/utils/style'

export const root = css`
  label: heatmap-component;
`

export const cssVarDefaults = {
  '--vis-heatmap-cell-fill-color': '#ebedf0',
  '--vis-heatmap-cell-stroke-color': 'transparent',
  '--vis-heatmap-cell-stroke-width': '0px',
  '--vis-heatmap-cell-cursor': 'default',

  // Default sequential color steps. Used when neither `color` nor `colorRange` is set.
  '--vis-heatmap-color-1': '#9be9a8',
  '--vis-heatmap-color-2': '#40c463',
  '--vis-heatmap-color-3': '#30a14e',
  '--vis-heatmap-color-4': '#216e39',

  '--vis-heatmap-label-color': '#6e7781',
  '--vis-heatmap-label-font-size': '12px',
  // Undefined by default to allow proper fallback to var(--vis-font-family)
  '--vis-heatmap-label-font-family': undefined as string | undefined,
  '--vis-heatmap-label-font-weight': '400',

  /* Dark Theme */
  '--vis-dark-heatmap-cell-fill-color': '#161b22',
  '--vis-dark-heatmap-color-1': '#0e4429',
  '--vis-dark-heatmap-color-2': '#006d32',
  '--vis-dark-heatmap-color-3': '#26a641',
  '--vis-dark-heatmap-color-4': '#39d353',
  '--vis-dark-heatmap-label-color': '#7d8590',
}

export const variables = getCssVarNames(cssVarDefaults)
injectGlobalCssVariables(cssVarDefaults, root)

// Default quantized color steps, used when neither `color` nor `colorRange` is configured.
// Referenced by literal name because `getCssVarNames` doesn't camel-case numeric suffixes.
export const defaultColorRange = [
  'var(--vis-heatmap-color-1)',
  'var(--vis-heatmap-color-2)',
  'var(--vis-heatmap-color-3)',
  'var(--vis-heatmap-color-4)',
]

export const cell = css`
  label: cell;
  stroke: var(${variables.heatmapCellStrokeColor});
  stroke-width: var(${variables.heatmapCellStrokeWidth});
  cursor: var(${variables.heatmapCellCursor});
`

export const cellEmpty = css`
  label: cell-empty;
  fill: var(${variables.heatmapCellFillColor});
`

export const label = css`
  label: label;
  fill: var(${variables.heatmapLabelColor});
  font-size: var(${variables.heatmapLabelFontSize});
  font-family: var(${variables.heatmapLabelFontFamily}, var(--vis-font-family));
  font-weight: var(${variables.heatmapLabelFontWeight});
`

export const columnLabel = css`
  label: column-label;
  text-anchor: start;
  dominant-baseline: alphabetic;
`

export const rowLabel = css`
  label: row-label;
  text-anchor: end;
  dominant-baseline: middle;
`
