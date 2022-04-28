import { css, injectGlobal } from '@emotion/css'

export const root = css`
  label: chord-diagram-component;
`

export const variables = injectGlobal`
  :root {
    --vis-chord-diagram-link-fill-color: #cad5f6;
    --vis-chord-diagram-link-stroke-color: #777777;
    --vis-chord-diagram-link-stroke-opacity: 0.15;

    --vis-chord-diagram-label-text-fill-color-bright: #ffffff;
    --vis-chord-diagram-label-text-fill-color-dark: #a5abb2;

    --vis-dark-chord-diagram-link-fill-color: #575c65;
  }

  body.theme-dark ${`.${root}`} {
    --vis-chord-diagram-link-fill-color: var(--vis-dark-chord-diagram-link-fill-color);
  }
`

export const nodes = css`
  label: nodes;
`

export const links = css`
  label: links;
`

export const labels = css`
  label: labels;
`

export const node = css`
  label: node;
  stroke-width: 0;
  fill: var(--vis-color-main);
  stroke: var(--vis-color-main);

  &:hover {
    stroke-width: 2;
  }
`

export const hoveredNode = css`
  label: hovered;
  fill-opacity: 1;
  stroke-width: 1.5;
`

export const gLabel = css`
  label: group-label;
`

export const label = css`
  label: label;

  dominant-baseline: middle;
  user-select: none;
  pointer-events: none;

  > textPath {
    dominant-baseline: middle;
  }
`

export const labelExit = css`
  label: label-exit;
`

export const link = css`
  label: link;

  fill: var(--vis-chord-diagram-link-fill-color);
  stroke:  var(--vis-chord-diagram-link-stroke-color);
  stroke-opacity:  var(--vis-chord-diagram-link-stroke-opacity);
  transition: .1s fill-opacity;

  &:hover {
    fill-opacity: 1;
  }
`

export const hoveredLink = css`
  label: hovered;
  fill-opacity: 0.9;
`

export const transparent = css`
  fill-opacity: 0.25;

  text {
    fill-opacity: 1;
  }
`
