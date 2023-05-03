import { css } from '@emotion/css'

// Utils
import { getCssVarNames, injectGlobalCssVariables } from 'utils/style'

const cssVarDefaults = {
  '--vis-nested-donut-background-color': '#E7E9F3',
  // Undefined by default to allow proper fallback to var(--vis-font-family)
  '--vis-nested-donut-font-family': undefined,

  // Central label
  '--vis-nested-donut-central-label-font-size': '16px',
  '--vis-nested-donut-central-label-font-weight': 600,
  '--vis-nested-donut-central-label-text-color': '#5b5f6d',

  // Central sub-label
  '--vis-nested-donut-central-sublabel-font-size': '12px;',
  '--vis-nested-donut-central-sublabel-font-weight': 500,
  '--vis-nested-donut-central-sublabel-text-color': '#5b5f6d',

  // Segments
  '--vis-nested-donut-segment-stroke-width': '1px',
  '--vis-nested-donut-segment-stroke-color': undefined,
  '--vis-nested-donut-segment-label-text-color-light': '#5b5f6d',
  '--vis-nested-donut-segment-label-text-color-dark': '#fff',

  /* Dark theme */
  '--vis-dark-nested-donut-background-color': '#18160C',
  '--vis-dark-nested-donut-central-label-text-color': '#fff',
  '--vis-dark-nested-donut-central-sublabel-text-color': '#fff',
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
  user-select: none;
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
