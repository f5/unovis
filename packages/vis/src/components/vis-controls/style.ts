import { css, injectGlobal } from '@emotion/css'
import { DEFAULT_ICON_FONT_FAMILY } from 'styles/index'

export const root = css`
  label: vis-controls-component;
`

export const variables = injectGlobal`
  :root {
    --vis-controls-buttons-border-color: rgba(108, 119, 140, 0.15);
    --vis-controls-buttons-background-color: rgba(255, 255, 255, 1);
    --vis-controls-button-color: #6c778c;
    --vis-controls-button-icon-font: ${DEFAULT_ICON_FONT_FAMILY};

    --vis-dark-controls-buttons-border-color:  #6c778c;
    --vis-dark-controls-buttons-background-color: var(--vis-color-gray);
    --vis-dark-controls-button-color: #fff;
  }

  body.theme-dark ${`.${root}`} {
    --vis-controls-buttons-border-color: var(--vis-dark-controls.buttons-border-color);
    --vis-controls-buttons-background-color: var(--vis-dark-controls-buttons-background-color);
    --vis-controls-button-color: var(--vis-dark-controls-button-color);
  }
`

export const items = css`
  label: items;
  background-color: var(--vis-controls-buttons-background-color);
  border: 1px solid var(--vis-controls-buttons-border-color);
  border-radius: 4px;
  opacity: 1;
  transition: all 300ms;
`

export const horizontalItems = css`
  label: horizontal;
  display: inline-flex;
`

export const item = css`
  label: item;
`

export const itemButton = css`
  label: item-button;
  font-family: var(--vis-controls-button-icon-font);
  display: block;
  cursor: pointer;
  user-select: none;
  outline: none;
  width: 30px;
  height: 30px;
  line-height: 28px;
  border: none;
  border-radius: inherit;
  box-sizing: border-box;
  color: var(--vis-controls-button-color);
  background-color: inherit;
`

export const borderLeft = css`
  border-left: 1px solid var(--vis-controls-buttons-border-color);
`

export const borderTop = css`
  border-top: 1px solid var(--vis-controls-buttons-border-color);
`

export const borderRight = css`
  border-right: 1px solid var(--vis-controls-buttons-border-color);
`

export const borderBottom = css`
  border-bottom: 1px solid var(--vis-controls-buttons-border-color);
`

export const disabled = css`
  label: disabled;
  opacity: 0.4;
  pointer-events: none;
`
