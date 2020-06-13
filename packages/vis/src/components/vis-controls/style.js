// Copyright (c) Volterra, Inc. All rights reserved.
import { css, injectGlobal } from 'emotion'

export const variables = injectGlobal`
  :root {
    --vis-controls-buttons-border-color: rgba(108, 119, 140, 0.15);
    --vis-controls-button-color: #6c778c;
    --vis-controls-button-icon-font: FontAwesome;
  }
`

export const items = css`
  label: items;
  border: 1px solid var(--vis-controls-buttons-border-color);
  border-radius: 4px;
  opacity: 1;
  transition: all 300ms;
`

export const horizontalItems = css`
  label: horizontal;
  display: inline-flex;
`

export const item = css`
  label: item;
`

export const itemButton = css`
  label: item-button;
  font-family: var(--vis-controls-button-icon-font);
  display: block;
  cursor: pointer;
  user-select: none;
  outline: none;
  width: 30px;
  height: 30px;
  line-height: 28px;
  border: none;
  border-radius: inherit;
  box-sizing: border-box;
  color: var(--vis-controls-button-color);
  background-color: inherit;
`
