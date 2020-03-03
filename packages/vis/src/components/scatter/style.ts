// Copyright (c) Volterra, Inc. All rights reserved.
import { css } from 'emotion'

export const point = css`
  label: point;
  fill: var(--vis-color-main);
  user-select: none;

  &:hover {
    filter: var(--highlight-filter-id);
  }
`
