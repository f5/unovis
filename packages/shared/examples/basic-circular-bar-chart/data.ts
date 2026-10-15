import { colors, getCSSColorVariable } from '@unovis/ts'

// The default Unovis palette has six colors and the chart has seven bars, so the palette gets one more shade of blue.
// The default colors are referenced by their CSS variables, so that they follow the light and dark themes
export const palette: string[] = [...colors.map((_, i) => `var(${getCSSColorVariable(i)})`), '#57BAFF']

export type DataRecord = { key: string; value: number; unit: string; icon: string; color: string }

// Icons are Font Awesome glyphs (see styles.css): brain, apple, person walking, heart, child, bed, ear
export const data: DataRecord[] = [
  { key: 'Mindfulness', value: 12, unit: 'min', icon: '&#xf5dc;' },
  { key: 'Nutrition', value: 1650, unit: 'kcal', icon: '&#xf5d1;' },
  { key: 'Activity', value: 8300, unit: 'steps', icon: '&#xf554;' },
  { key: 'Heart', value: 62, unit: 'bpm', icon: '&#xf004;' },
  { key: 'Body', value: 71, unit: 'kg', icon: '&#xf1ae;' },
  { key: 'Sleep', value: 6.5, unit: 'h', icon: '&#xf236;' },
  { key: 'Hearing', value: 85, unit: 'dB', icon: '&#xf2a2;' },
].map((d, i) => ({ ...d, color: palette[i % palette.length] }))

export const maxValue: number[] = [15, 2000, 10000, 80, 80, 8, 100]
