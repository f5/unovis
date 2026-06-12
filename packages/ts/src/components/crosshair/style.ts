import { css } from '@emotion/css'
import { getCssVarNames, injectGlobalCssVariables } from 'utils/style'

export const root = css`
  label: crosshair-component;
`

export const cssVarDefaults: Record<string, string | undefined> = {
  '--vis-crosshair-line-stroke-color': '#888',
  '--vis-crosshair-line-stroke-width': '1px',
  '--vis-crosshair-line-stroke-opacity': '1',
  '--vis-crosshair-line-stroke-dasharray': 'none',
  '--vis-crosshair-circle-stroke-color': '#fff',
  '--vis-crosshair-circle-stroke-width': '1px',
  '--vis-crosshair-circle-stroke-opacity': '0.75',
}

export const variables = getCssVarNames(cssVarDefaults)
injectGlobalCssVariables(cssVarDefaults, root)

export const line = css`
  stroke: var(${variables.crosshairLineStrokeColor});
  stroke-width: var(${variables.crosshairLineStrokeWidth});
  stroke-opacity: var(${variables.crosshairLineStrokeOpacity});
  stroke-dasharray: var(${variables.crosshairLineStrokeDasharray});
  pointer-events: none;
`

export const lineHorizontal = css`
  stroke: var(${variables.crosshairLineStrokeColor});
  stroke-width: var(${variables.crosshairLineStrokeWidth});
  stroke-opacity: var(${variables.crosshairLineStrokeOpacity});
  stroke-dasharray: var(${variables.crosshairLineStrokeDasharray});
  pointer-events: none;
`

export const circle = css`
  stroke: var(${variables.crosshairCircleStrokeColor});
  stroke-width: var(${variables.crosshairCircleStrokeWidth});
  stroke-opacity: var(${variables.crosshairCircleStrokeOpacity});
  pointer-events: none;
`
