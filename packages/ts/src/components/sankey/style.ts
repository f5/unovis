import { css, injectGlobal } from '@emotion/css'
import { UNOVIS_ICON_FONT_FAMILY_DEFAULT } from 'styles/index'

export const SANKEY_ICON_SIZE = 22

export const root = css`
  label: sankey-component;
`

export const variables = injectGlobal`
  :root {
     /* Links */
    --vis-sankey-link-cursor: default;
    --vis-sankey-link-color: var(--vis-color-main-light);
    --vis-sankey-link-opacity: 0.5;
    --vis-sankey-link-hover-opacity: 1.0;
    /* Nodes */
    --vis-sankey-node-cursor: default;
    --vis-sankey-node-color: var(--vis-color-main);
    --vis-sankey-node-label-color: #575c65;
    --vis-sankey-node-opacity: 0.9;
    --vis-sankey-node-hover-opacity: 1.0;
    /* Node Labels */
    --vis-sankey-node-label-background-fill-color: #ffffff;
    --vis-sankey-node-label-background-stroke-color: #eaeaea;
    --vis-sankey-node-label-background-opacity: 0.9;
    --vis-sankey-node-label-color: #575c65;
    --vis-sankey-node-label-cursor: default;
    --vis-sankey-node-label-font-weight: 600;
    --vis-sankey-node-label-font-size: 12px;
    --vis-sankey-node-label-text-decoration: none;

    --vis-sankey-node-sublabel-font-size: 10px;
    --vis-sankey-node-sublabel-font-weight: 500;

    /* Icons */
    --vis-sankey-icon-size: ${SANKEY_ICON_SIZE}px;
    --vis-sankey-icon-color: #ffffff;
    --vis-sankey-icon-stroke-opacity: 0.6;
    --vis-sankey-icon-font-family: ${UNOVIS_ICON_FONT_FAMILY_DEFAULT};

    // Undefined by default to allow proper fallback to var(--vis-font-family)
    /* --vis-sankey-label-font-family: */

    /* Dark Theme */
    --vis-dark-sankey-link-color: var(--vis-color-main-dark);
    --vis-dark-sankey-node-color: var(--vis-color-main);
    --vis-dark-sankey-node-label-color: #eaeaea;
    --vis-dark-sankey-node-label-background-fill-color: #292b34;
    --vis-dark-sankey-node-label-background-stroke-color: #575c65;
    --vis-dark-sankey-icon-color: #292b34;
  }

  body.theme-dark ${`.${root}`} {
    --vis-sankey-node-color: var(--vis-dark-sankey-node-color);
    --vis-sankey-link-color: var(--vis-dark-sankey-link-color);
    --vis-sankey-node-label-color: var(--vis-dark-sankey-node-label-color);
    --vis-sankey-node-label-background-fill-color: var(--vis-dark-sankey-label-background-fill-color);
    --vis-sankey-node-label-background-stroke-color: var(--vis-dark-sankey-label-background-stroke-color);
    --vis-sankey-icon-color: var(--vis-dark-sankey-icon-color);
  }
`

export const links = css`
  label: links;
`

export const nodes = css`
  label: nodes;
`

export const link = css`
  label: link;

  path {
    cursor: var(--vis-sankey-link-cursor);
    fill: var(--vis-sankey-link-color);
    fill-opacity: var(--vis-sankey-link-opacity);
  }

  &:hover {
    path {
      fill-opacity: var(--vis-sankey-link-hover-opacity);
    }
  }
`

export const linkPath = css`
  label: visible;
`

export const linkSelectionHelper = css`
  label: transparent;
  opacity: 0;
`

export const labelGroup = css`
  label: label-group;
  cursor: var(--vis-sankey-node-label-cursor);
`

export const labelTrimmed = css`
  label: label-trimmed;
`

export const label = css`
  label: label;
  dominant-baseline: hanging;

  fill: var(--vis-sankey-node-label-color);
  text-decoration: var(--vis-sankey-node-label-text-decoration);
  font-weight: var(--vis-sankey-node-label-font-weight);
  user-select: none;

  &, tspan {
    font-family: var(--vis-sankey-label-font-family, var(--vis-font-family));
    dominant-baseline: hanging;
  }
`

export const sublabel = css`
  label: sub-label;
  dominant-baseline: hanging;

  fill: var(--vis-sankey-node-label-color);
  user-select: none;

  &, tspan {
    font-family: var(--vis-sankey-label-font-family, var(--vis-font-family));
    font-weight: var(--vis-sankey-node-sublabel-font-weight);
    dominant-baseline: hanging;
  }
`

export const labelBackground = css`
  label: label-background;
  stroke: var(--vis-sankey-node-label-background-stroke-color);
  fill: var(--vis-sankey-node-label-background-fill-color);
  opacity: var(--vis-sankey-node-label-background-opacity);
`

export const hidden = css`
  label: hidden;
  visibility: hidden;
`

export const forceShow = css`
  label: forceShow;
  visibility: visible;
`

export const nodeGroup = css`
  label: node-group;
`

export const node = css`
  label: node;

  cursor: var(--vis-sankey-node-cursor);
  fill: var(--vis-sankey-node-color);
  opacity: var(--vis-sankey-node-opacity);

  &:hover {
    opacity: var(--vis-sankey-node-hover-opacity);
  }
`

export const nodeIcon = css`
  label: icon;

  font-family: var(--vis-sankey-icon-font-family);
  text-anchor: middle;
  font-size: var(--vis-sankey-icon-size);
  fill: var(--vis-sankey-node-icon-color);
  stroke: var(--vis-sankey-node-color);
  stroke-opacity: var(--vis-sankey-icon-stroke-opacity);
  user-select: none;
  pointer-events: none;
`

export const nodeExit = css`
  label: node-exit;
`

export const background = css`
  label: background;
`
