import { css } from '@emotion/css'

// Utils
import { getCssVarNames, injectGlobalCssVariables } from 'utils/style'

const cssVarDefaults = {
  '--vis-annotations-text-color': '#282C34',

  '--vis-annotations-connector-stroke-color': '#444',
  '--vis-annotations-connector-stroke-width': '1px',
  '--vis-annotations-connector-stroke-dasharray': 'none',

  '--vis-annotations-subject-stroke-color': '#444',
  '--vis-annotations-subject-fill-color': 'none',
  '--vis-annotations-subject-stroke-dasharray': 'none',

  '--vis-annotations-debug-bounding-box-stroke-color': '#f00',

  '--vis-dark-annotations-text-color': '#e8e9ef',
  '--vis-dark-annotations-connector-stroke-color': '#fff',
  '--vis-dark-annotations-subject-stroke-color': '#fff',
}

export const root = css`
  label: annotations-component;
`
export const variables = getCssVarNames(cssVarDefaults)
injectGlobalCssVariables(cssVarDefaults, root)

export const annotation = css`
  label: annotation;
`

export const annotationSubject = css`
  label: annotationSubject;

  line {
    stroke: var(${variables.annotationsConnectorStrokeColor});
    stroke-width: var(${variables.annotationsConnectorStrokeWidth});
    stroke-dasharray: var(${variables.annotationsConnectorStrokeDasharray});
  }

  circle {
    stroke: var(${variables.annotationsSubjectStrokeColor});
    fill: var(${variables.annotationsSubjectFillColor});
    stroke-dasharray: var(${variables.annotationsSubjectStrokeDasharray});
  }
`

export const annotationContent = css`
  label: annotationContent;
  > text {
    fill: var(--vis-annotations-text-color);
  }
`

export const debugBoundingBox = css`
  label: debugBoundingBox;
  fill: none;
  stroke: var(--vis-annotations-debug-bounding-box-stroke-color);
  stroke-width: 1;
`
