import { injectGlobal } from '@emotion/css'
import { getCSSVariableValue } from 'utils/misc'
<<<<<<< HEAD
import { darkThemeCssSelectors } from 'utils/theme'
=======
import { UNOVIS_PATTERN_INDEX_ATTR } from 'utils/pattern'
>>>>>>> aae5ca68 (Core | Styles | Utils: Add pattern accessor infrastructure and theme-patterns index attribute)
import { UnovisText } from 'types/text'
import { colors, colorsDark, getCSSColorVariable, getLighterColor, getDarkerColor } from './colors'
import { fills, lines, getPatternVariable } from './patterns'

export const UNOVIS_ICON_FONT_FAMILY_DEFAULT = globalThis?.UNOVIS_ICON_FONT_FAMILY || 'FontAwesome'
export const UNOVIS_FONT_WH_RATIO_DEFAULT: number = globalThis?.UNOVIS_FONT_W2H_RATIO_DEFAULT || 0.5
export const UNOVIS_TEXT_SEPARATOR_DEFAULT: string[] = globalThis?.UNOVIS_TEXT_SEPARATOR_DEFAULT || [' ', '-', '.', ',']
export const UNOVIS_TEXT_HYPHEN_CHARACTER_DEFAULT: string = globalThis?.UNOVIS_TEXT_HYPHEN_CHARACTER_DEFAULT || '-'
export const UNOVIS_TEXT_DEFAULT_FONT_SIZE: number = globalThis?.UNOVIS_TEXT_DEFAULT_FONT_SIZE || 12
export const UNOVIS_TEXT_DEFAULT: UnovisText = globalThis?.UNOVIS_TEXT_DEFAULT || {
  // If you change these defaults, don't forget to update the values in the `UnovisText` type in `types/text.ts`
  text: '',
  fontSize: UNOVIS_TEXT_DEFAULT_FONT_SIZE,
  fontFamily: 'var(--vis-font-family)',
  lineHeight: 1.25,
  marginTop: 0,
  marginBottom: 0,
}

export const variables = injectGlobal`
  :root {
    label: vis-root-styles;
    --vis-font-family: Inter, Arial, "Helvetica Neue", Helvetica, sans-serif;
    --vis-font-wh-ratio: ${UNOVIS_FONT_WH_RATIO_DEFAULT};
    --vis-color-main: var(${getCSSColorVariable(0)});
    --vis-color-main-light: ${getLighterColor(colors[0])};
    --vis-color-main-dark: ${getDarkerColor(colors[0])};
    --vis-color-grey: #2a2a2a;
    ${colors.map((c, i) => `${getCSSColorVariable(i)}: ${c};`)}
    ${colorsDark.map((c, i) => `--vis-dark-color${i}: ${c};`)}
    ${fills.map((p, i) => `
      --${getPatternVariable(p)}: url(#${getPatternVariable(p)});
      --vis-pattern-fill${i}: var(--${getPatternVariable(p)});
    `)}
    ${lines.map((p, i) => `
      --${getPatternVariable(p)}: url(#${getPatternVariable(p)});
      --vis-pattern-marker${i}: var(--${getPatternVariable(p)});
      --vis-pattern-dasharray${i}: ${p.dashArray?.join(' ')};
    `)}

    ${darkThemeCssSelectors} {
      ${colors.map((c, i) => `${getCSSColorVariable(i)}: var(--vis-dark-color${i});`)}
    }

    body.theme-patterns {
      ${fills.map((_, i) => `path[${UNOVIS_PATTERN_INDEX_ATTR}="${i}"][style*="fill"]:not([style*="mask"]) {
        mask: var(--vis-pattern-fill${i});
      }`)}
      ${lines.map((_, i) => `
      path[${UNOVIS_PATTERN_INDEX_ATTR}="${i}"]:not([style*="fill"]):not([style*="marker"]) {
        marker: var(--vis-pattern-marker${i});
        stroke-dasharray: var(--vis-pattern-dasharray${i});
      }
    `)}
}
`

export function getFontWidthToHeightRatio (context: HTMLElement | SVGGElement | undefined = window?.document.body): number {
  return context ? +getCSSVariableValue('var(--vis-font-wh-ratio)', context) : UNOVIS_FONT_WH_RATIO_DEFAULT
}
