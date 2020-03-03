// Copyright (c) Volterra, Inc. All rights reserved.
import { css } from 'emotion'

export const line = css`
  label: line;
  fill: none;
  stroke: var(--vis-color-main);

  &:hover {
    filter: var(--highlight-filter-id);
  }
`
