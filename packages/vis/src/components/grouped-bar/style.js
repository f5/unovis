// Copyright (c) Volterra, Inc. All rights reserved.
import { css } from 'emotion'

export const bar = css`
  label: bar;
  stroke: none;
  fill: var(--vis-color-main);
  fill-opacity: 0.9;

  &:hover {
    fill-opacity: 1;
  }
`

export const barGroup = css`
  label: barGroup;
`

export const barGroupExit = css`
  label: barGroupExit;
`
