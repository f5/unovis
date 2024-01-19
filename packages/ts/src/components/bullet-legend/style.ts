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
    --vis-legend-bullet-inactive-color: #eee;
    --vis-legend-item-spacing: 20px;
    --vis-legend-bullet-label-spacing: 8px;

    --vis-dark-legend-label-color: #eee;
    --vis-dark-legend-bullet-inactive-color: #6c778c;
  }

  body.theme-dark ${`.${root}`} {
    --vis-legend-label-color: var(--vis-dark-legend-label-color);
    --vis-legend-bullet-inactive-color: var(--vis-dark-legend-bullet-inactive-color);
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
  label: legendItemBullet;
  margin-right: var(--vis-legend-bullet-label-spacing);
  max-width: calc(var(--vis-legend-bullet-size) * 2);
  height: var(--vis-legend-bullet-size);
  display: block;
}
`
