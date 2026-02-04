import { css, injectGlobal } from '@emotion/css'
import { UNOVIS_ICON_FONT_FAMILY_DEFAULT } from '@/styles/index'
import { FlowLegendItem } from './types'

export const root = css`
  label: flow-legend-component;
  position: relative;
  user-select: none;
`

export const globalStyles = injectGlobal`
  :root {
    --vis-flow-legend-label-background: #ffffff;
    --vis-flow-legend-label-color: #71788a;
    --vis-flow-legend-link-color: #E5E9F7;
    --vis-flow-legend-arrow-color: #E5E9F7;
    --vis-flow-legend-label-padding: 5px 10px;
    --vis-flow-legend-arrow-padding: 0 5px;
    /* --vis-flow-legend-arrow-font-family: Undefined by default to allow proper fallback to var(DEFAULT_ICON_FONT_FAMILY)*/

    --vis-dark-flow-legend-label-background: #292b34;
    --vis-dark-flow-legend-label-color: #E5E9F7;
    --vis-dark-flow-legend-link-color: #71788a;
    --vis-dark-flow-legend-arrow-color: #71788a;
  }

  body.theme-dark ${`.${root}`} {
    --vis-flow-legend-label-background: var(--vis-dark-flow-legend-label-background);
    --vis-flow-legend-label-color: var(--vis-dark-flow-legend-label-color);
    --vis-flow-legend-link-color: var(--vis-dark-flow-legend-link-color);
    --vis-flow-legend-arrow-color: var(--vis-dark-flow-legend-arrow-color);
  }
`

export const labels = (spacing: number, lineColor: string, items: FlowLegendItem[]): string => css`
  label: labels;

  position: relative;
  width: ${spacing ? 'fit-content' : '100%'};
  display: flex;
  align-items: center;
  justify-content: ${items.length > 1 ? 'space-between' : 'center'};
  gap: ${spacing ? `${spacing}px` : 'unset'};

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    transform: translateY(-50%);
    background-color: ${lineColor || 'var(--vis-flow-legend-link-color)'};
    opacity: ${items.length > 1 ? 1 : 0};
  }
`

export const item = css`
  label: item;
  position: relative;

  :first-child > span {
    padding-left: 0;
  }

  :last-child > span {
    padding-right: 0;
  }

`

export const clickable = css`
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`

export const label = (labelFontSize: number, labelColor: string): string => css`
  label: label;
  padding: var(--vis-flow-legend-label-padding);
  background-color: var(--vis-flow-legend-label-background);
  font-size: ${labelFontSize}px;
  color: ${labelColor || 'var(--vis-flow-legend-label-color)'};
  display: inline-table;
  text-align: center;
`

export const arrow = (arrowColor: string, arrowSymbolYOffset: number): string => css`
  label: arrow;
  font-family: var(--vis-flow-legend-arrow-font-family, ${UNOVIS_ICON_FONT_FAMILY_DEFAULT});
  font-size: 9px;
  vertical-align: middle;
  color: ${arrowColor || 'var(--vis-flow-legend-arrow-color)'};
  background-color: var(--vis-flow-legend-label-background);
  padding: var(--vis-flow-legend-arrow-padding);
  display: inline-table;
  text-align: center;
  transform: translateY(${arrowSymbolYOffset || 0}px);
`
