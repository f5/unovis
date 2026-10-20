import { css } from '@emotion/css'

export const mainContainer = css`
  label: main-container;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
`

export const controlsContainer = css`
  label: controls-container;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: var(--dev-panel-background);
  color: var(--dev-text);
  border-radius: 8px;
  margin-bottom: 20px;
  width: max-content;
`

export const controlsTitle = css`
  label: controls-title;
  margin: 0 0 15px 0;
  font-family: var(--dev-font-family);
`

export const sliderRow = css`
  label: slider-row;
  margin: 10px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--dev-font-family);
  font-size: 13px;
`

export const sliderLabel = css`
  label: slider-label;
  min-width: 200px;
`

export const sliderInput = css`
  label: slider-input;
  width: 200px;
`

export const sliderValue = css`
  label: slider-value;
  min-width: 40px;
`

export const graphContainer = css`
  label: graph-container;
  flex: 1;
`
