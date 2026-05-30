export type DataRecord = { key: string; value: number; unit: string }

export const data: DataRecord[] = [
  { key: 'Steps', value: 8300, unit: 'steps' },
  { key: 'Calories', value: 420, unit: 'kcal' },
  { key: 'Move', value: 25, unit: 'min' },
]

export const maxValue: number[] = [10000, 600, 30]

export const completion: number = Math.round(
  100 * data.reduce((sum, d, i) => sum + d.value / maxValue[i], 0) / data.length
)
