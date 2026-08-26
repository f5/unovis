import type * as CSS from 'csstype'

export type UnovisCssVariablesDefinition = Record<string, string | undefined>

/** An inline style object: standard CSS and SVG properties in camelCase or kebab-case,
 * plus `--custom-property` keys */
export type StyleDeclaration =
  CSS.Properties<string | number> &
  CSS.PropertiesHyphen<string | number> &
  { [key: `--${string}`]: string | number }
