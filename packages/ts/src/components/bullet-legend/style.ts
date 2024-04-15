import { css, injectGlobal } from '@emotion/css'

export const root = css`
  label: bullet-legend-component;
`

export const variables = injectGlobal`
  :root {
    // Undefined by default to allow proper fallback to var(--vis-font-family)
    /* --vis-legend-font-family: */

    --vis-legend-label-color: #6c778c;
    --vis-legend-label-max-width: 300px;
    --vis-legend-label-font-size: 12px;
    --vis-legend-bullet-size: 9px;
    --vis-legend-bullet-inactive-opacity: 0.15;
    --vis-legend-item-spacing: 20px;
    --vis-legend-vertical-item-spacing: 5px;
    --vis-legend-bullet-label-spacing: 8px;

    --vis-dark-legend-label-color: #eee;
  }

  body.theme-dark ${`.${root}`} {
    --vis-legend-label-color: var(--vis-dark-legend-label-color);
  }

  body.theme-patterns {
    --vis-legend-bullet-size: 14px;
  }
`

export const item = css`
  label: legendItem;
  display: inline-flex;
  align-items: center;
  font-family: var(--vis-legend-font-family, var(--vis-font-family));
  margin-right: var(--vis-legend-item-spacing);
  white-space: nowrap;
  cursor: default;
  user-select: none;
  max-width: min-content;
`

export const itemVertical = css`
  label: legendItemVertical;
  display: flex;
  margin-top: var(--vis-legend-vertical-item-spacing);
`

export const clickable = css`
  cursor: pointer;
`

export const label = css`
  label: legendItemLabel;
  font-size: var(--vis-legend-label-font-size);
  display: inline-block;
  vertical-align: middle;
  color: var(--vis-legend-label-color);
  max-width: var(--vis-legend-label-max-width);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`

export const bullet = css`
  flex: 0 0 auto;
  label: legendItemBullet;
  margin-right: var(--vis-legend-bullet-label-spacing);
  height: var(--vis-legend-bullet-size);
  width: var(--vis-legend-bullet-size);

  svg {
    display: block;
  }
`
