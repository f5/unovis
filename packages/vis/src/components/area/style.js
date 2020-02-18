// Copyright (c) Volterra, Inc. All rights reserved.
import { css } from 'emotion'

export const area = css`
  label: area;

  fill: var(--vis-color-main);
  fill-opacity: 0.9;
  transition: fill-opacity 200ms;

  &:hover {
    fill-opacity: 1.0;
  }
`
