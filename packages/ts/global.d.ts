/* eslint-disable no-var */
export {}

declare global {
  namespace globalThis {
    var UNOVIS_COLORS: string[]
    var UNOVIS_COLORS_DARK: string[]
    var UNOVIS_ICON_FONT_FAMILY: string
    var UNOVIS_FONT_W2H_RATIO_DEFAULT: number
    var UNOVIS_TEXT_SEPARATOR_DEFAULT: string[]
    var UNOVIS_TEXT_HYPHEN_CHARACTER_DEFAULT: string
    var UNOVIS_TEXT_DEFAULT: {
      text: string;
      fontSize: number;
      fontFamily: string;
      lineHeight: number;
      marginTop: number;
      marginBottom: number;
    }
  }
}
