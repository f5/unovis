import { colors, getCSSColorVariable } from '@unovis/ts'

// The default Unovis palette has six colors; the seven-petal examples need one more, so the palette is extended
// with an extra shade of blue. The first six entries stay CSS variables to follow the light / dark theme.
export const circularBarPalette: string[] = [
  ...colors.map((_, i) => `var(${getCSSColorVariable(i)})`),
  '#57BAFF',
]

export const getCircularBarColor = (_: unknown, i: number): string => circularBarPalette[i % circularBarPalette.length]
