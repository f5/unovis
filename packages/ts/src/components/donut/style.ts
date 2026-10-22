import { css, injectGlobal } from '@/styles/emotion'
import { darkThemeCssSelectors } from '@/utils/theme'

export const root = css`
  label: donut-component;
`

export const variables = injectGlobal`
  :root {
    --vis-donut-central-label-font-size: 16px;
    --vis-donut-central-label-text-color: #5b5f6d;
    // Undefined by default to allow proper fallback to var(--vis-font-family)
    /* --vis-donut-central-label-font-family: */
    --vis-donut-central-label-font-weight: 600;

    --vis-donut-central-sub-label-font-size: 12px;
    --vis-donut-central-sub-label-text-color: #5b5f6d;
    // Undefined by default to allow proper fallback to var(--vis-font-family)
    /* --vis-donut-central-sub-label-font-family: */
    --vis-donut-central-sub-label-font-weight: 500;

    --vis-donut-background-color: #E7E9F3;
    --vis-donut-segment-stroke-width: 0;
    // The line segment color variable is not defined by default
    // to allow it to fallback to the donut background color
    /* --vis-donut-segment-stroke-color: none; */

    --vis-donut-icon-color: rgba(255, 255, 255, 0.9);
    // Undefined by default to allow proper fallback to var(--vis-font-family)
    /* --vis-donut-icon-font-family: */
    --vis-donut-icon-font-weight: normal;

    --vis-dark-donut-central-label-text-color: #C2BECE;
    --vis-dark-donut-central-sub-label-text-color: #C2BECE;
    --vis-dark-donut-background-color: #18160C;
    --vis-dark-donut-icon-color: rgba(255, 255, 255, 0.9);
  }

  ${darkThemeCssSelectors} ${`.${root}`} {
    --vis-donut-central-label-text-color: var(--vis-dark-donut-central-label-text-color);
    --vis-donut-central-sub-label-text-color: var(--vis-dark-donut-central-sub-label-text-color);
    --vis-donut-background-color: var(--vis-dark-donut-background-color);
    --vis-donut-icon-color: var(--vis-dark-donut-icon-color);
  }
`
export const background = css`
  label: background;
  fill: var(--vis-donut-background-color);
`

export const segment = css`
  label: segment;
  stroke-width: var(--vis-donut-segment-stroke-width);
  stroke: var(--vis-donut-segment-stroke-color, var(--vis-donut-background-color));
`

export const segmentExit = css`
  label: segment-exit;
`

export const iconGroup = css`
  label: icon-group;
  pointer-events: none;
`

const iconStyles = `
  fill: var(--vis-donut-icon-color);
  color: var(--vis-donut-icon-color);

  text {
    font-family: var(--vis-donut-icon-font-family, var(--vis-font-family));
    font-weight: var(--vis-donut-icon-font-weight);
    text-anchor: middle;
    dominant-baseline: central;
  }
`

export const icon = css`
  label: icon;
  ${iconStyles}
`

// Exiting icons get their own class, so that an icon coming back during its fade-out is re-created instead of reused
export const iconExit = css`
  label: icon-exit;
  ${iconStyles}
`

export const centralLabel = css`
  label: central-label;
  text-anchor: middle;
  dominant-baseline: middle;
  font-size: var(--vis-donut-central-label-font-size);
  font-family: var(--vis-donut-central-label-font-family, var(--vis-font-family));
  font-weight: var(--vis-donut-central-label-font-weight);
  fill: var(--vis-donut-central-label-text-color);
`

export const centralSubLabel = css`
  label: central-label;
  text-anchor: middle;
  dominant-baseline: middle;
  font-size: var(--vis-donut-central-sub-label-font-size);
  font-family: var(--vis-donut-central-sub-label-font-family, var(--vis-font-family));
  font-weight: var(--vis-donut-central-sub-label-font-weight);
  fill: var(--vis-donut-central-sub-label-text-color);
`
