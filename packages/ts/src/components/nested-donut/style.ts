import { css } from '@emotion/css'

// Utils
import { getCssVarNames, injectGlobalCssVariables } from 'utils/style'

export const labelColors = {
  dark: '#5b5f6d',
  light: '#fff',
}

const cssVarDefaults = {
  '--vis-nested-donut-background-color': '#E7E9F3',
  // Undefined by default to allow proper fallback to var(--vis-font-family)
  '--vis-nested-donut-font-family': undefined,

  // Central label
  '--vis-nested-donut-central-label-font-size': '16px',
  '--vis-nested-donut-central-label-font-weight': 600,
  '--vis-nested-donut-central-label-text-color': labelColors.dark,

  // Central sub-label
  '--vis-nested-donut-central-sublabel-font-size': '12px;',
  '--vis-nested-donut-central-sublabel-font-weight': 500,
  '--vis-nested-donut-central-sublabel-text-color': labelColors.dark,

  // Segments
  '--vis-nested-donut-segment-stroke-width': '1px',
  '--vis-nested-donut-segment-stroke-color': '',

  /* Dark theme */
  '--vis-dark-nested-donut-background-color': '#18160C',
  '--vis-dark-nested-donut-central-label-text-color': labelColors.light,
  '--vis-dark-nested-donut-central-sublabel-text-color': labelColors.light,
}

export const root = css`
  label: nested-donut-component;
`

export const variables = getCssVarNames(cssVarDefaults)
injectGlobalCssVariables(cssVarDefaults, root)

export const background = css`
  label: background;
  fill: var(--vis-donut-background-color);
`

export const segment = css`
  label: segment;
  stroke-width: var(--vis-nested-donut-segment-stroke-width);
  stroke: var(--vis-nested-donut-segment-stroke-color, var(--vis-donut-background-color));
`

export const segmentLabel = css`
  label: segment-label;
  text-anchor: middle;
  dominant-baseline: middle;
`

export const segmentExit = css`
  label: segment-exit;
`

export const centralLabel = css`
  label: central-label;
  text-anchor: middle;
  dominant-baseline: middle;
  font-size: var(--vis-nested-donut-central-label-font-size);
  font-family: var(--vis-nested-donut-central-label-font-family, var(--vis-font-family));
  font-weight: var(--vis-nested-donut-central-label-font-weight);
  fill: var(--vis-nested-donut-central-label-text-color);
`

export const centralSubLabel = css`
  label: central-sub-label;
  text-anchor: middle;
  dominant-baseline: middle;
  font-size: var(--vis-nested-donut-central-sublabel-font-size);
  font-family: var(--vis-nested-donut-central-sublabel-font-family, var(--vis-font-family));
  font-weight: var(--vis-nested-donut-central-sublabel-font-weight);
  fill: var(--vis-nested-donut-central-sublabel-text-color);
`
