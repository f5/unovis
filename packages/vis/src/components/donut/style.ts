// Copyright (c) Volterra, Inc. All rights reserved.
import { css, injectGlobal } from '@emotion/css'

export const root = css`
  label: donut-component;
`

export const variables = injectGlobal`
  :root {
    --vis-donut-central-label-font-size: 16px;
    --vis-donut-central-label-text-color: #5b5f6d;
    --vis-donut-central-label-font-family: var(--vis-font-family);
    --vis-donut-central-label-font-weight: 600;

    --vis-dark-donut-central-label-text-color: #C2BECE;
  }

  body.theme-dark .${root} {
    --vis-donut-central-label-text-color: var(--vis-dark-donut-central-label-text-color);
  }
`


export const segment = css`
  label: segment;
`

export const segmentExit = css`
  label: segment-exit;
`

export const centralLabel = css`
  label: central-label;
  text-anchor: middle;
  dominant-baseline: middle;
  font-size: var(--vis-donut-central-label-font-size);
  font-family: var(--vis-donut-central-label-font-family);
  font-weight: var(--vis-donut-central-label-font-weight);
  fill: var(--vis-donut-central-label-text-color);
`
