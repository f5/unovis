// Copyright (c) Volterra, Inc. All rights reserved.
import { css, injectGlobal } from 'emotion'

export const variables = injectGlobal`
  :root {
    --vis-legend-label-color: #333;
    --vis-legend-label-max-width: 300px;
    --vis-legend-label-font-size: 12pt;
    --vis-legend-bullet-size: 10px;
    --vis-legend-bullet-inactive-color: #eee;
  }
`

export const item = css`
  label: legendItem;
  display: inline;
  margin-right: 20px;
  white-space: nowrap;
  cursor: default;
  user-select: none;

  &.clickable {
    cursor: pointer;
  }
`

export const label = css`
  label: legendItemLabel;
  font-size: var(--vis-legend-label-font-size);
  display: inline-block;
  vertical-align: middle;
  color: var(--vis-legend-label-color);
  max-width: var(--vis-legend-label-max-width);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`

export const bullet = css`
  label: legendItemBullet;
  border-radius: 100%;
  background-color: var(--vis-legend-bullet-inactive-color);
  border: 1px solid;
  display: inline-block;
  margin-right: 10px;
  width: var(--vis-legend-bullet-size);
  height: var(--vis-legend-bullet-size);
  vertical-align: middle;

  .inactive {
    
  }
`
