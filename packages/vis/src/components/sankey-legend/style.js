// Copyright (c) Volterra, Inc. All rights reserved.
import { css } from 'emotion'
import 'styles/component-css-variables/sankey'

export const container = css`
  label: sankey-label;

  position: relative;
  user-select: none;
`

export const line = css`
  label: line;

  height: 2px;
  width: 100%;
  background-color: var(--sankey-link-color);
  position: absolute;
  top: 50%;
`

export const items = css`
  label: items;

  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const item = css`
  label: item;

  display: inline;
  background-color: white;

  padding: 10px;
  &:first-child {
    padding-left: 0px;
  }

  &:last-child {
    padding-right: 0px;
  }
`

export const label = css`
  label: label;

  display: inline-table;
  max-width: 50px;
  text-align: center;
`

export const arrow = css`
  label: arrow;

  font-size: 12px;
  color: var(--sankey-link-color);
`
