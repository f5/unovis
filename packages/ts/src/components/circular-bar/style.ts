import { css } from '@/styles/emotion'
import { getCssVarNames, injectGlobalCssVariables } from '@/utils/style'

export const root = css`
  label: circular-bar-component;
`

export const cssVarDefaults = {
  '--vis-circular-bar-background-color': '#E7E9F3',
  '--vis-circular-bar-bar-stroke-width': '0',
  // The bar stroke color variable is not defined by default
  // to allow it to fallback to the background color
  '--vis-circular-bar-bar-stroke-color': undefined as string | undefined,

  '--vis-circular-bar-icon-color': 'rgba(255, 255, 255, 0.9)',
  // Undefined by default to allow proper fallback to var(--vis-font-family)
  '--vis-circular-bar-icon-font-family': undefined as string | undefined,
  '--vis-circular-bar-icon-font-weight': 'normal',

  /* Dark Theme */
  '--vis-dark-circular-bar-background-color': '#444444',
  '--vis-dark-circular-bar-icon-color': 'rgba(255, 255, 255, 0.9)',
}

export const variables = getCssVarNames(cssVarDefaults)
injectGlobalCssVariables(cssVarDefaults, root)

export const background = css`
  label: background;
  fill: var(${variables.circularBarBackgroundColor});
`

export const bar = css`
  label: bar;
  stroke-width: var(${variables.circularBarBarStrokeWidth});
  stroke: var(${variables.circularBarBarStrokeColor}, var(${variables.circularBarBackgroundColor}));
`

export const barExit = css`
  label: bar-exit;
`

export const iconGroup = css`
  label: icon-group;
  pointer-events: none;
`

const iconStyles = `
  fill: var(${variables.circularBarIconColor});
  color: var(${variables.circularBarIconColor});

  text {
    font-family: var(${variables.circularBarIconFontFamily}, var(--vis-font-family));
    font-weight: var(${variables.circularBarIconFontWeight});
    text-anchor: middle;
    dominant-baseline: central;
  }
`

export const icon = css`
  label: icon;
  ${iconStyles}
`

// Exiting icons get their own class, so that an icon coming back during its fade-out is re-created instead of reused
export const iconExit = css`
  label: icon-exit;
  ${iconStyles}
`
