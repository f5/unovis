import { injectGlobal } from '@emotion/css'
import { colors, colorsDark, getCSSColorVariable, getLighterColor, getDarkerColor } from './colors'

export const DEFAULT_ICON_FONT_FAMILY = globalThis?.UNOVIS_ICON_FONT_FAMILY || 'FontAwesome'

export const variables = injectGlobal`
  :root {
    label: vis-root-styles;
    --vis-font-family: Inter, Arial, "Helvetica Neue", Helvetica, sans-serif;
    --vis-color-main: var(${getCSSColorVariable(0)});
    --vis-color-main-light: ${getLighterColor(colors[0])};
    --vis-color-main-dark: ${getDarkerColor(colors[0])};
    --vis-color-grey: #2a2a2a;
    ${colors.map((c, i) => `${getCSSColorVariable(i)}: ${c};`)}
    ${colorsDark.map((c, i) => `--vis-dark-color${i}: ${c};`)}

    body.theme-dark {
      ${colors.map((c, i) => `${getCSSColorVariable(i)}: var(--vis-dark-color${i});`)}
    }
  }
`
