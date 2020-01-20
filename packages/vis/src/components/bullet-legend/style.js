// Copyright (c) Volterra, Inc. All rights reserved.
import { css } from 'emotion'

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
  font-size: 12pt;
  display: inline-block;
  vertical-align: middle;
  color: var(--vis-legend-label-color);
  max-width: 300px;
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
  width: 10px;
  height: 10px;
  vertical-align: middle;

  .inactive {
    
  }
`
