import { css, injectGlobal } from '@emotion/css'

export const root = css`
  label: timeline-component;
`

export const globalStyles = injectGlobal`
  :root {
    --vis-timeline-row-even-fill-color: #FFFFFF;
    --vis-timeline-row-odd-fill-color: #F7FAFC;
    --vis-timeline-row-background-opacity: 1;
    --vis-timeline-scrollbar-background-color: #E6E9F3;
    --vis-timeline-scrollbar-color: #9EA7B8;

    --vis-timeline-label-font-size: 12px;
    --vis-timeline-label-color: #6C778C;

    --vis-timeline-cursor: default;
    --vis-timeline-line-color: var(--vis-color-main);
    --vis-timeline-line-stroke-width: 0;
    // The line stroke color variable is not defined by default
    // to allow it to fallback to the corresponding row background color
    /* --vis-timeline-line-stroke-color: none; */

    --vis-dark-timeline-row-even-fill-color: #292B34;
    --vis-dark-timeline-row-odd-fill-color: #333742;
    --vis-dark-timeline-scrollbar-background-color: #292B34;
    --vis-dark-timeline-scrollbar-color: #6C778C;
    --vis-dark-timeline-label-color: #EFF5F8;
  }

  body.theme-dark ${`.${root}`} {
    --vis-timeline-row-even-fill-color: var(--vis-dark-timeline-row-even-fill-color);
    --vis-timeline-row-odd-fill-color: var(--vis-dark-timeline-row-odd-fill-color);
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
  fill: var(--vis-timeline-line-color);
  cursor: var(--vis-timeline-cursor);

  stroke: var(--vis-timeline-line-stroke-color, var(--vis-timeline-row-even-fill-color));
  stroke-width: var(--vis-timeline-line-stroke-width);

  &.odd {
    stroke: var(--vis-timeline-line-stroke-color, var(--vis-timeline-row-odd-fill-color));
  }
`

export const rows = css`
  label: rows;
`

export const row = css`
  label: row;
  fill: var(--vis-timeline-row-even-fill-color);
  opacity: var(--vis-timeline-row-background-opacity);

  &.odd {
    fill: var(--vis-timeline-row-odd-fill-color);
  }
`

export const rowOdd = css`
  label: row-odd;
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
