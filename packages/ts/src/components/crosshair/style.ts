import { css } from '@/styles/emotion'
import { getCssVarNames, injectGlobalCssVariables } from '@/utils/style'

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

// Keyboard navigation announcements: available to screen readers, but not displayed
export const liveRegion = css`
  label: crosshair-live-region;
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
`
