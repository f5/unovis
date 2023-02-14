import { css, injectGlobal } from '@emotion/css'

export const root = css`
  label: flow-legend-component;

  position: relative;
  user-select: none;
`

export const globalStyles = injectGlobal`
  :root {
    --vis-flow-legend-label-background: #ffffff;
    --vis-flow-legend-label-color: #71788a;
    --vis-flow-legend-link-color: #E5E9F7;
    --vis-flow-legend-arrow-color: #E5E9F7;
    --vis-flow-legend-label-padding: '5px 15px';
    --vis-flow-legend-arrow-padding: '0 10px';

    --vis-dark-flow-legend-label-background: #292b34;
    --vis-dark-flow-legend-label-color: #E5E9F7;
    --vis-dark-flow-legend-link-color: #71788a;
    --vis-dark-flow-legend-arrow-color: #71788a;
  }

  body.theme-dark ${`.${root}`} {
    --vis-flow-legend-label-background: var(--vis-dark-flow-legend-label-background);
    --vis-flow-legend-label-color: var(--vis-dark-flow-legend-label-color);
    --vis-flow-legend-link-color: var(--vis-dark-flow-legend-link-color);
    --vis-flow-legend-arrow-color: var(--vis-dark-flow-legend-arrow-color);
  }
`

export const line = (lineColor: string): string => css`
  label: line;

  height: 2px;
  width: 100%;
  background-color: ${lineColor || 'var(--vis-flow-legend-link-color)'};
  position: absolute;
  top: 50%;
`

export const labels = css`
  label: labels;

  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const item = css`
  label: item;

  position: relative;
  max-width: 50px;

  padding: 10px;
`

export const clickable = css`
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`

export const label = (labelFontSize: number, labelColor: string): string => css`
  label: label;

  transform: translate(-50%, 0%);
  margin-left: 7px;
  background-color: var(--vis-flow-legend-label-background);
  padding: var(--vis-flow-legend-legend-padding);
  font-size: ${labelFontSize}px;
  color: ${labelColor || 'var(--vis-flow-legend-label-color)'};
  display: inline-table;
  text-align: center;
`

export const arrow = (arrowColor: string): string => css`
  label: arrow;

  font-size: 9px;
  vertical-align: middle;
  color: ${arrowColor || 'var(--vis-flow-legend-arrow-color)'};
  background-color: var(--vis-flow-legend-label-background);
  padding: var(--vis-flow-legend-arrow-padding);
  transform: translate(-25%, 0%);
  display: inline-table;
  text-align: center;
`
