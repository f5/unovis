export type DataRecord = { borough: string; good: number; fair: number; poor: number; unknown: number; total: number }

export const data: DataRecord[] = [
  { borough: 'Bronx', good: 66603, fair: 10887, poor: 3095, unknown: 0, total: 80585 },
  { borough: 'Brooklyn', good: 138212, fair: 25073, poor: 6459, unknown: 0, total: 169744 },
  { borough: 'Manhattan', good: 47358, fair: 11460, poor: 3609, unknown: 0, total: 62427 },
  { borough: 'Queens', good: 194008, fair: 34549, poor: 9417, unknown: 0, total: 237974 },
  { borough: 'Staten Island', good: 82669, fair: 14535, poor: 4238, unknown: 1, total: 101443 },
]
