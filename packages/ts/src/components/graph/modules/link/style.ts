import { css, injectGlobal } from '@emotion/css'

export const links = css`
  label: links;
`

export const variables = injectGlobal`
  :root {
    --vis-graph-link-stroke-color: #e6e9f3;
    --vis-graph-link-stroke-opacity: 1.0;
    --vis-graph-link-greyout-opacity: 0.3;
    --vis-graph-link-dashed-stroke-dasharray: 6 6;

    --vis-graph-link-label-font-size: 9pt;
    --vis-graph-link-label-background: #e6e9f3;
    --vis-graph-link-label-text-color-dark: #18181B;
    --vis-graph-link-label-text-color-bright: #fff;
    --vis-graph-link-label-text-color: var(--vis-graph-link-label-text-color-dark);

    --vis-graph-link-band-opacity: 0.35;
    --vis-graph-link-support-stroke-width: 10px;

    --vis-dark-graph-link-stroke-color: #494b56;
    --vis-dark-graph-link-label-background: #3f3f45;
    --vis-dark-graph-link-label-text-color: var(--vis-graph-link-label-text-color-bright);

    --vis-graph-link-dominant-baseline: middle;
  }

  body.theme-dark ${`.${links}`} {
    --vis-graph-link-stroke-color: var(--vis-dark-graph-link-stroke-color);
    --vis-graph-link-label-stroke-color: var(--vis-dark-graph-link-label-stroke-color);
    --vis-graph-link-label-text-color: var(--vis-dark-graph-link-label-text-color);
    --vis-graph-link-label-background: var(--vis-dark-graph-link-label-background);
  }
`

export const linkSupport = css`
  label: link-support;

  fill: none;
  stroke-linecap: round;
  pointer-events: stroke;
  stroke-width: var(--vis-graph-link-support-stroke-width);
  stroke-opacity: 0;
  stroke: var(--vis-graph-link-stroke-color);
  transition: stroke-opacity 0.2s;
`

export const link = css`
  label: link;

  fill: none;
  stroke: var(--vis-graph-link-stroke-color);
  stroke-opacity: var(--vis-graph-link-stroke-opacity);
  transition: stroke 800ms;
  stroke-linecap: round;
  pointer-events: none;
`

export const linkDashed = css`
  label: dashed;

  ${`.${link}`} {
    stroke-dasharray: var(--vis-graph-link-dashed-stroke-dasharray);
  }
`

export const linkArrow = css`
  label: link-arrow;
  fill: var(--vis-graph-link-stroke-color);
`

export const gLink = css`
  label: g-link;
`

export const gLinkExit = css`
  label: g-link-exit;
  pointer-events: none;
`

export const greyout = css`
  label: greyout;
  opacity: var(--vis-graph-link-greyout-opacity);
`

export const linkBand = css`
  label: link-band;

  stroke-opacity: var(--vis-graph-link-band-opacity);
  pointer-events: none;
  stroke: var(--vis-graph-node-stroke-color);
  fill: none;
`

export const flowGroup = css`
  label: flow-group;

  pointer-events: none;
`

export const flowCircle = css`
  label: flow-circle;

  fill: var(--vis-graph-link-stroke-color);
`

export const linkLabelGroup = css`
  label: label-group;
  pointer-events: all;
`

export const linkLabelBackground = css`
  label: label-background;

  fill: var(--vis-graph-link-label-background);
`

export const linkLabelContent = css`
  label: label-content;

  font-size: var(--vis-graph-link-label-font-size);
  font-family: var(--vis-font-family);
  fill: var(--vis-graph-link-label-text-color);
  text-anchor: middle;
  dominant-baseline: var(--vis-graph-link-dominant-baseline);
  user-select: none;
`
