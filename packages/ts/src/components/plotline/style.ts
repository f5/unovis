import { css, injectGlobal } from '@emotion/css'

export const root = css`
  label: plotline-component;
`

export const plotline = css`
  label: plotline;
  transition: opacity 200ms;
  cursor: var(--vis-line-cursor);
`
export const plotlinePath = css`
  label: plotlinePath;
  fill: none;
`
