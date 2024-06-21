import { css, injectGlobal } from '@emotion/css'

export const root = css`
  label: tooltip;
  display: inline-block;
  left: 0;
  bottom: 0;
  min-width: max-content;
  position: absolute;
  opacity: 0;
  transition: opacity;
  transition-duration: var(--vis-tooltip-transition-duration);
  z-index: 999999;
  padding: var(--vis-tooltip-padding);
  color: var(--vis-tooltip-text-color);
  border-radius: var(--vis-tooltip-border-radius);
  box-shadow: var(--vis-tooltip-box-shadow);
  border: solid 1px var(--vis-tooltip-border-color);
  background-color: var(--vis-tooltip-background-color);
  backdrop-filter: var(--vis-tooltip-backdrop-filter);
`

/**
 * @deprecated This selector is deprecated and will be removed in future versions. Use `root` instead.
 */
export const tooltip = root

export const variables = injectGlobal`
  :root {
    --vis-tooltip-background-color: rgba(255, 255, 255, 0.95);
    --vis-tooltip-border-color: #e5e9f7;
    --vis-tooltip-text-color: #000;
    --vis-tooltip-shadow-color: rgba(172, 179, 184, 0.35);
    --vis-tooltip-backdrop-filter: none;
    --vis-tooltip-padding: 10px 15px;
    --vis-tooltip-border-radius: 5px;
    --vis-tooltip-transition-duration: 300ms;
    --vis-tooltip-box-shadow: none;

    --vis-dark-tooltip-background-color: rgba(30,30,30, 0.95);
    --vis-dark-tooltip-text-color: #e5e9f7;
    --vis-dark-tooltip-border-color: var(--vis-color-grey);
    --vis-dark-tooltip-shadow-color: rgba(0,0,0, 0.95);
  }

  body.theme-dark ${`.${root}`} {
    --vis-tooltip-background-color: var(--vis-dark-tooltip-background-color);
    --vis-tooltip-text-color: var(--vis-dark-tooltip-text-color);
    --vis-tooltip-border-color: var(--vis-dark-tooltip-border-color);
    --vis-tooltip-shadow-color: var(--vis-dark-tooltip-shadow-color);
  }

  body.theme-dark {
    --vis-tooltip-background-color: rgba(30,30,30, 0.95);
    --vis-tooltip-text-color: #e5e9f7;
    --vis-tooltip-border-color: var(--vis-color-grey);
    --vis-tooltip-shadow-color: rgba(0,0,0, 0.95);
  }
`

export const positionFixed = css`
  bottom: unset;
  position: fixed;
`

export const show = css`
  opacity: 1;
`

export const hidden = css`
  display: none;
`

export const nonInteractive = css`
  label: non-interactive;
  pointer-events: none;
  user-select: none;
`
