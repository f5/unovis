export type DataRecord = { date: Date; count: number }

const DAY = 24 * 60 * 60 * 1000
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
// Only label alternating rows, like GitHub (Mon / Wed / Fri)
const WEEKDAYS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

export const numRows = 7

// Deterministic pseudo-random so the example is stable across renders
const rnd = (i: number): number => {
  const x = Math.sin((i + 1) * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

const numDays = 364 // 52 weeks
const end = new Date()
end.setHours(0, 0, 0, 0)
const start = new Date(end.getTime() - (numDays - 1) * DAY)

// Day of week of the first datum (0 = Sun). Empty cells fill the column above it.
export const offset = start.getDay()

export const data: DataRecord[] = Array.from({ length: numDays }, (_, i) => {
  const date = new Date(start.getTime() + i * DAY)
  const weekend = date.getDay() === 0 || date.getDay() === 6
  const r = rnd(i)
  const count = r < (weekend ? 0.55 : 0.3) ? 0 : Math.round(r * (weekend ? 6 : 16))
  return { date, count }
})

// Month label per column: shown only on the first column the month appears in
const numColumns = Math.ceil((data.length + offset) / numRows)
const monthLabels: (string | undefined)[] = []
let prevMonth = -1
for (let c = 0; c < numColumns; c += 1) {
  const dataIndex = c * numRows - offset
  if (dataIndex < 0) { monthLabels[c] = undefined; continue }
  const month = new Date(start.getTime() + dataIndex * DAY).getMonth()
  monthLabels[c] = month !== prevMonth ? MONTHS[month] : undefined
  prevMonth = month
}

export const columnLabel = (column: number): string | undefined => monthLabels[column]
export const rowLabel = (row: number): string => WEEKDAYS[row]
