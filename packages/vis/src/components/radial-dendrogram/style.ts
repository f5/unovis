// Copyright (c) Volterra, Inc. All rights reserved.
import { css } from 'emotion'

export const node = css`
  label: node;
  stroke-width: 0;
  fill: var(--vis-color-main);
  stroke: var(--vis-color-main);

  &:hover {
    stroke-width: 2;
  }
`
