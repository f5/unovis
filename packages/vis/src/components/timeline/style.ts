import { css, injectGlobal } from '@emotion/css'

export const root = css`
  label: timeline-component;
`

export const global = injectGlobal`
  :root {
    --vis-timeline-row-even-fill: #fff;
    --vis-timeline-row-odd-fill: #EFF5F8;
    --vis-timeline-row-background-opacity: 0.5;
    --vis-timeline-scrollbar-background-color: #E6E9F3;
    --vis-timeline-scrollbar-color: #9EA7B8;

    --vis-timeline-label-font-size: 12px;
    --vis-timeline-label-color: #6C778C;

    --vis-timeline-cursor: default;
    --vis-timeline-line-color: var(--vis-color-main);
    --vis-timeline-line-cap: round;

    --vis-dark-timeline-row-even-fill: #292B34;
    --vis-dark-timeline-row-odd-fill: #6C778C;
    --vis-dark-timeline-scrollbar-background-color: #292B34;
    --vis-dark-timeline-scrollbar-color: #6C778C;
    --vis-dark-timeline-label-color: #EFF5F8;
  }

  body.theme-dark ${`.${root}`} {
    --vis-timeline-row-even-fill: var(--vis-dark-timeline-row-even-fill);
    --vis-timeline-row-odd-fill: var(--vis-dark-timeline-row-odd-fill);
    --vis-timeline-scrollbar-background-color: var(--vis-dark-timeline-scrollbar-background-color);
    --vis-timeline-scrollbar-color: var(--vis-dark-timeline-scrollbar-color);
    --vis-timeline-label-color: var(--vis-dark-timeline-label-color);
  }
`

export const background = css`
  label: background;
`

export const lines = css`
  label: lines;
`

export const line = css`
  label: line;
  fill: none;
  stroke: var(--vis-timeline-line-color);
  cursor: var(--vis-timeline-cursor);
  stroke-linecap: var(--vis-timeline-line-cap);
`

export const rows = css`
  label: rows;
`

export const rect = css`
  label: rect;
  pointer-events: none;
  fill: var(--vis-timeline-row-even-fill);
  opacity: var(--vis-timeline-row-background-opacity);

  &.odd {
    fill: var(--vis-timeline-row-odd-fill);
  }
`

export const scrollbar = css`
  label: scroll-bar;
`

export const scrollbarHandle = css`
  label: scroll-bar-handle;
  fill: var(--vis-timeline-scrollbar-color);
`

export const scrollbarBackground = css`
  label: scroll-bar-background;
  fill: var(--vis-timeline-scrollbar-background-color);
`

export const labels = css`
  label: labels;
`

export const label = css`
  label: label;
  dominant-baseline: middle;
  font-size: var(--vis-timeline-label-font-size);
  fill: var(--vis-timeline-label-color);
  text-anchor: end;
  user-select: none;
`
