// Copyright (c) Volterra, Inc. All rights reserved.
import { css } from 'emotion'

export const bar = css`
  label: bar;
  stroke: none;
  fill: var(--vis-color-main);

  &:hover {
    filter: var(--highlight-filter-id);
  }
`

export const barGroup = css`
  label: barGroup;
`

export const barGroupExit = css`
  label: barGroupExit;
`
