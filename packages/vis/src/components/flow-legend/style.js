// Copyright (c) Volterra, Inc. All rights reserved.
import { css, injectGlobal } from 'emotion'

export const global = injectGlobal`
  :root {
    --vis-flow-legend-label-color: #71788a;
    --vis-flow-legend-link-color: #E5E9F7;
  }
`
export const container = css`
  label: flow-label;

  position: relative;
  user-select: none;
`

export const line = ({ lineColor }) => css`
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

export const label = ({ labelFontSize, labelColor }) => css`
  label: label;

  position: absolute;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 5px 15px;
  font-size: ${labelFontSize}px;
  color: ${labelColor || 'var(--vis-flow-legend-label-color)'};
  display: inline-table;
  text-align: center;
`

export const arrow = ({ lineColor }) => css`
  label: arrow;

  font-size: 9px;
  vertical-align: middle;
  color: ${lineColor || 'var(--vis-flow-legend-link-color)'};
`
