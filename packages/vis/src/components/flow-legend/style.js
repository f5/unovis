// Copyright (c) Volterra, Inc. All rights reserved.
import { css, injectGlobal } from 'emotion'

export const global = injectGlobal`
  :root {
    --flow-label-color: #2a2a2a;
    --flow-link-color: #E5E9F7;
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
  background-color: ${lineColor || 'var(--flow-link-color)'};
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
  padding: 5px;
  font-size: ${labelFontSize}px;
  color: ${labelColor || 'var(--flow-label-color)'};
  display: inline-table;
  text-align: center;
`

export const arrow = ({ lineColor }) => css`
  label: arrow;

  font-size: 10px;
  vertical-align: middle;
  color: ${lineColor || 'var(--flow-link-color)'};
`
