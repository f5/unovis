import { css } from '@emotion/css'
import { getCssVarNames, injectGlobalCssVariables } from 'utils/style'

export const root = css`
  label: boxplot-component;
`

export const cssVarDefaults: Record<string, string | undefined> = {
  '--vis-boxplot-cursor': 'default',
  '--vis-boxplot-fill-color': 'var(--vis-color-main)',
  '--vis-boxplot-fill-opacity': '0.2',
  '--vis-boxplot-stroke-color': 'var(--vis-color-main)',
  '--vis-boxplot-stroke-width': '1.5px',
  '--vis-boxplot-median-stroke-color': 'var(--vis-color-main)',
  '--vis-boxplot-median-stroke-width': '1.5px',
  '--vis-boxplot-whisker-stroke-color': 'var(--vis-color-main)',
  '--vis-boxplot-whisker-stroke-width': '1.5px',

  /* Dark Theme */
  '--vis-dark-boxplot-fill-color': 'var(--vis-color-main)',
  '--vis-dark-boxplot-stroke-color': 'var(--vis-color-main)',
  '--vis-dark-boxplot-median-stroke-color': 'var(--vis-color-main)',
  '--vis-dark-boxplot-whisker-stroke-color': 'var(--vis-color-main)',
}

export const variables = getCssVarNames(cssVarDefaults)
injectGlobalCssVariables(cssVarDefaults, root)

export const boxGroup = css`
  label: boxGroup;
`

export const boxGroupExit = css`
  label: boxGroupExit;
`

export const box = css`
  label: box;
  fill: var(${variables.boxplotFillColor});
  fill-opacity: var(${variables.boxplotFillOpacity});
  stroke: var(${variables.boxplotStrokeColor});
  stroke-width: var(${variables.boxplotStrokeWidth});
  cursor: var(${variables.boxplotCursor});
`

export const median = css`
  label: median;
  stroke: var(${variables.boxplotMedianStrokeColor});
  stroke-width: var(${variables.boxplotMedianStrokeWidth});
`

export const whisker = css`
  label: whisker;
  stroke: var(${variables.boxplotWhiskerStrokeColor});
  stroke-width: var(${variables.boxplotWhiskerStrokeWidth});
`

export const whiskerCap = css`
  label: whiskerCap;
  stroke: var(${variables.boxplotWhiskerStrokeColor});
  stroke-width: var(${variables.boxplotWhiskerStrokeWidth});
`
