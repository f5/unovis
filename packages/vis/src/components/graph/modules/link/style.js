// Copyright (c) Volterra, Inc. All rights reserved.
import { css, injectGlobal, keyframes } from 'emotion'

export const variables = injectGlobal`
  :root {
    --vis-graph-link-stroke-color: #acb3b8;
    --vis-graph-link-label-stroke-color: #fff;
    --vis-graph-link-label-text-color: #fff;
    --vis-graph-link-label-fill-color: #acb3b8;
  }
`

export const links = css`
  label: links;
`

export const linkSupport = css`
  label: link-support;

  fill: none;
  stroke-linecap: round;
  pointer-events: stroke;
  stroke-width: 15px;
  stroke-opacity: 0;
  stroke: var(--vis-graph-link-stroke-color);
  transition: .2s;
`

export const link = css`
  label: link;

  fill: none;
  stroke: var(--vis-graph-link-stroke-color);
  transition: stroke 800ms;
  stroke-linecap: round;
  stroke-width: 1;
  pointer-events: none;
`

const dash = keyframes`
  to {
    stroke-dashoffset: -300;
  }
`

export const linkDashed = css`
  label: dashed;
`

export const gLink = css`
  label: g-link;

  &${`.${linkDashed}`} {
    ${`.${link}`}, ${`.${linkSupport}`} {
      animation: ${dash} 15s linear infinite;
      stroke-dasharray: 6 6;
    }
  }
`
export const greyout = css`
  label: greyout;
  opacity: 0.1;
`

export const linkBand = css`
  label: link-band;

  stroke-opacity: 0.35;
  pointer-events: none;
  stroke: var(--vis-graph-node-stroke-color);
`

export const flowGroup = css`
  label: flow-group;

  pointer-events: none;
`

export const flowCircle = css`
  label: flow-circle;

  fill: var(--vis-graph-link-stroke-color);
`

export const labelGroups = css`
  label: label-groups;
`

export const labelGroup = css`
  label: label-group;
  pointer-events: none;
`

export const labelCircle = css`
  label: label-circle;

  fill: var(--vis-graph-link-label-fill-color);
  stroke: var(--vis-graph-link-label-stroke-color);
`

export const labelContent = css`
  label: label-content;

  fill: var(--vis-graph-link-label-text-color);
  font-size: 8pt;
  text-anchor: middle;
  dominant-baseline: middle;
`
