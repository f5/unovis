import { css } from '@emotion/css'
import { getCssVarNames, injectGlobalCssVariables } from 'utils/style'

export const root = css`
  display: flex;
`

const cssVarDefaults = {
  '--vis-rolling-pin-legend-label-color': '#6c778c;',
  '--vis-rolling-pin-legend-label-max-width': '300px;',
  '--vis-rolling-pin-legend-label-font-size': '12px;',
  '--vis-rolling-pin-legend-spacing': '4px;',
  '--vis-rolling-pin-legend-item-width': '8px;',
  '--vis-dark-rolling-pin-legend-label-color': '#eee;',
}

export const variables = getCssVarNames(cssVarDefaults)
injectGlobalCssVariables(cssVarDefaults, root)

export const rectsContainer = css`
  display: flex;
  margin: 0 var(${variables.rollingPinLegendSpacing});
`

export const label = css`
  font-family: var(--vis-rolling-pin-legend-font-family, var(--vis-font-family));
  font-size: var(${variables.rollingPinLegendLabelFontSize});
  max-width: var(${variables.rollingPinLegendLabelMaxWidth});
  color: var(${variables.darkRollingPinLegendLabelColor});
`

export const rect = css`
  display: inline-block;
  flex: 1;
  width: var(${variables.rollingPinLegendItemWidth};
`
