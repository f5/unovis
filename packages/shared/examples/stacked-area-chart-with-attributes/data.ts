import type { BulletLegendItemInterface } from '@unovis/ts'

export enum Country {
  UnitedStates = 'us',
  India = 'in',
  China = 'cn',
}

export const bulletLegends: Record<Country, BulletLegendItemInterface> = {
  [Country.UnitedStates]: { name: 'United States', color: 'var(--vis-color0)' },
  [Country.India]: { name: 'India', color: 'var(--vis-color1)' },
  [Country.China]: { name: 'China', color: 'var(--vis-color2)' },
}

export type FoodExportData = Record<Country, number> & { year: number };

export const countries: Country[] = [Country.UnitedStates, Country.India, Country.China]

export const data: FoodExportData[] = [
  { year: 1990, us: 11.08, cn: 11.35, in: 15.58 },
  { year: 1995, us: 10.53, cn: 8.27, in: 18.68 },
  { year: 2000, us: 7.31, cn: 5.44, in: 12.79 },
  { year: 2005, us: 7.47, cn: 3.23, in: 8.97 },
  { year: 2010, us: 10.11, cn: 2.94, in: 8.26 },
  { year: 2015, us: 10.30, cn: 2.71, in: 11.33 },
  { year: 2020, us: 11.49, cn: 2.69, in: 12.77 },
  { year: 2023, us: 9.45, cn: 2.46, in: 11.01 },
]
