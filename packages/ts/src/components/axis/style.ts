import { css } from '@emotion/css'
import { getCssVarNames, injectGlobalCssVariables } from 'utils/style'

export const root = css`
  label: axis-component;
`

export const cssVarDefaults: Record<string, string | undefined> = {
  '--vis-axis-font-family': undefined, // Undefined by default to allow proper fallback to var(--vis-font-family)
  '--vis-axis-tick-color': '#e8e9ef',
  '--vis-axis-domain-color': undefined, // Undefined by default to allow fallback to var(--vis-axis-tick-color)
  '--vis-axis-domain-line-dasharray': undefined, // Undefined by default to allow fallback to var(--vis-axis-grid-line-dasharray)
  '--vis-axis-grid-color': '#e8e9ef',
  '--vis-axis-grid-line-width': '1px',
  '--vis-axis-grid-line-dasharray': 'none',
  '--vis-axis-grid-opacity': '1',
  '--vis-axis-grid-transition': 'none',

  '--vis-axis-label-font-size': '14px',
  '--vis-axis-label-color': '#6c778c',
  '--vis-axis-label-weight': '500',

  '--vis-axis-tick-label-color': '#6c778c',
  '--vis-axis-tick-label-font-size': '12px',
  '--vis-axis-tick-label-weight': '500',
  '--vis-axis-tick-label-cursor': 'default',
  '--vis-axis-tick-label-text-decoration': 'none',

  '--vis-axis-tick-line-width': '1px',
  '--vis-axis-tick-label-hide-transition': 'opacity 400ms ease-in-out',

  '--vis-axis-domain-line-width': undefined, // Undefined by default to allow fallback to var(--vis-axis-grid-line-width)

  '--vis-dark-axis-tick-color': '#6c778c',
  '--vis-dark-axis-domain-color': undefined, // Undefined by default to allow fallback to var(--vis-dark-axis-tick-color)
  '--vis-dark-axis-tick-label-color': '#e8e9ef',
  '--vis-dark-axis-grid-color': '#6c778c',
  '--vis-dark-axis-label-color': '#fefefe',
}

export const variables = getCssVarNames(cssVarDefaults)
injectGlobalCssVariables(cssVarDefaults, root)

export const hideTickLine = css`
  label: hide-tick-line;
`

export const hideDomain = css`
  label: hide-domain;
`

export const axis = css`
  label: axis;

  user-select: none;

  .domain {
    stroke: var(${variables.axisDomainColor}, var(${variables.axisTickColor}));
    stroke-width: var(${variables.axisDomainLineWidth}, var(${variables.axisGridLineWidth}));
    stroke-dasharray: var(${variables.axisDomainLineDasharray}, var(${variables.axisGridLineDasharray}));
  }

  &${`.${hideTickLine}`} {
    .tick > line {
      opacity: 0;
    }
  }

  &${`.${hideDomain}`} {
    .domain {
      opacity: 0;
    }
  }
`

export const grid = css`
  label: grid;

  .domain {
    opacity: 0;
  }

  line {
    stroke: var(${variables.axisGridColor});
    stroke-width: var(${variables.axisGridLineWidth});
    stroke-dasharray: var(${variables.axisGridLineDasharray});
    opacity: var(${variables.axisGridOpacity});
    transition: var(${variables.axisGridTransition});
  }
`

export const tick = css`
  label: tick;

  stroke: none;
  font-size: var(${variables.axisTickLabelFontSize});
  font-weight: var(${variables.axisTickLabelWeight});

  line {
    stroke: var(${variables.axisTickColor});
    stroke-width: var(${variables.axisTickLineWidth});
  }

  text {
    fill: var(${variables.axisTickLabelColor});
    cursor: var(${variables.axisTickLabelCursor});
    font-family: var(${variables.axisFontFamily}, var(--vis-font-family));
    text-decoration: var(${variables.axisTickLabelTextDecoration});
    stroke: none;
  }
`

export const tickTextExiting = css`
  label: tick-text-exiting;
`

export const label = css`
  label: label;
  fill: var(${variables.axisLabelColor});
  font-size: var(${variables.axisLabelFontSize});
  font-weight: var(${variables.axisLabelWeight});
  font-family: var(${variables.axisFontFamily}, var(--vis-font-family));
  text-anchor: middle;
`

export const tickLabel = css`
  label: tick-label;
`

export const tickLabelHideable = css`
  label: tick-label-hideable;
  opacity: 0;
  transition: var(${variables.axisTickLabelHideTransition});
`
