import type React from 'react'

// Font Awesome 6 solid glyphs (the dev app loads the Font Awesome stylesheet globally):
// brain, apple, person walking, heart, child, bed, ear
export const circularBarIcons: string[] = ['&#xf5dc;', '&#xf5d1;', '&#xf554;', '&#xf004;', '&#xf1ae;', '&#xf236;', '&#xf2a2;']

export const getCircularBarIcon = (_: unknown, i: number): string => circularBarIcons[i % circularBarIcons.length]

// Font Awesome's stylesheet maps the solid glyphs to the 900 font weight
export const circularBarIconStyle = {
  '--vis-circular-bar-icon-font-family': '"Font Awesome 6 Free"',
  '--vis-circular-bar-icon-font-weight': 900,
} as React.CSSProperties
