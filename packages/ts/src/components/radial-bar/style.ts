import { css } from '@emotion/css'
import { getCssVarNames, injectGlobalCssVariables } from 'utils/style'

export const root = css`
  label: radial-bar-component;
`

export const cssVarDefaults = {
  '--vis-radial-bar-central-label-font-size': '24px',
  '--vis-radial-bar-central-label-text-color': '#5b5f6d',
  // Undefined by default to allow proper fallback to var(--vis-font-family)
  '--vis-radial-bar-central-label-font-family': undefined as string | undefined,
  '--vis-radial-bar-central-label-font-weight': '600',
  '--vis-radial-bar-central-label-text-anchor': 'middle',

  '--vis-radial-bar-central-sub-label-font-size': '12px',
  '--vis-radial-bar-central-sub-label-text-color': '#5b5f6d',
  // Undefined by default to allow proper fallback to var(--vis-font-family)
  '--vis-radial-bar-central-sub-label-font-family': undefined as string | undefined,
  '--vis-radial-bar-central-sub-label-font-weight': '500',
  '--vis-radial-bar-central-sub-label-text-anchor': 'middle',

  '--vis-radial-bar-background-color': '#E7E9F3',
  '--vis-radial-bar-bar-stroke-width': '0',
  // The bar stroke color variable is not defined by default
  // to allow it to fallback to the background color
  '--vis-radial-bar-bar-stroke-color': undefined as string | undefined,

  /* Dark Theme */
  '--vis-dark-radial-bar-central-label-text-color': '#C2BECE',
  '--vis-dark-radial-bar-central-sub-label-text-color': '#C2BECE',
  '--vis-dark-radial-bar-background-color': '#444444',
}

export const variables = getCssVarNames(cssVarDefaults)
injectGlobalCssVariables(cssVarDefaults, root)

export const background = css`
  label: background;
  fill: var(${variables.radialBarBackgroundColor});
`

export const bar = css`
  label: bar;
  stroke-width: var(${variables.radialBarBarStrokeWidth});
  stroke: var(${variables.radialBarBarStrokeColor}, var(${variables.radialBarBackgroundColor}));
`

export const barExit = css`
  label: bar-exit;
`

export const centralLabel = css`
  label: central-label;
  text-anchor: var(${variables.radialBarCentralLabelTextAnchor});
  dominant-baseline: middle;
  font-size: var(${variables.radialBarCentralLabelFontSize});
  font-family: var(${variables.radialBarCentralLabelFontFamily}, var(--vis-font-family));
  font-weight: var(${variables.radialBarCentralLabelFontWeight});
  fill: var(${variables.radialBarCentralLabelTextColor});
`

export const centralSubLabel = css`
  label: central-sub-label;
  text-anchor: var(${variables.radialBarCentralSubLabelTextAnchor});
  dominant-baseline: middle;
  font-size: var(${variables.radialBarCentralSubLabelFontSize});
  font-family: var(${variables.radialBarCentralSubLabelFontFamily}, var(--vis-font-family));
  font-weight: var(${variables.radialBarCentralSubLabelFontWeight});
  fill: var(${variables.radialBarCentralSubLabelTextColor});
`
