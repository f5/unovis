import React from 'react'
import { VisSingleContainer, VisHeatmap } from '@unovis/react'
import { Sizing } from '@unovis/ts'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'GitHub Contributions Heatmap'
export const subTitle = 'A year of activity — weeks as columns, days as rows'

const DAY = 24 * 60 * 60 * 1000
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
// Only label alternating rows, like GitHub (Mon / Wed / Fri)
const WEEKDAYS = ['', 'Mon', '', 'Wed', '', 'Fri', '']
const NUM_ROWS = 7

// Deterministic pseudo-random so the layout is stable across re-renders
const rnd = (i: number): number => {
  const x = Math.sin((i + 1) * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

type DataRecord = { date: Date; count: number }

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const numDays = 365
  const end = new Date()
  end.setHours(0, 0, 0, 0)
  const start = new Date(end.getTime() - (numDays - 1) * DAY)
  // Day of week of the first datum (0 = Sun). Empty cells fill the column above it.
  const offset = start.getDay()

  const data: DataRecord[] = Array.from({ length: numDays }, (_, i) => {
    const date = new Date(start.getTime() + i * DAY)
    const weekend = date.getDay() === 0 || date.getDay() === 6
    const r = rnd(i)
    // ~quiet weekends, ~half the days have zero contributions
    const count = r < (weekend ? 0.55 : 0.3) ? 0 : Math.round(r * (weekend ? 6 : 16))
    return { date, count }
  })

  // Precompute month labels per column: show the month name on the first column it appears in
  const numColumns = Math.ceil((data.length + offset) / NUM_ROWS)
  const monthLabels: (string | undefined)[] = []
  let prevMonth = -1
  for (let c = 0; c < numColumns; c += 1) {
    const dataIndex = c * NUM_ROWS - offset // top cell (row 0) of this column
    if (dataIndex < 0) { monthLabels[c] = undefined; continue }
    const month = new Date(start.getTime() + dataIndex * DAY).getMonth()
    monthLabels[c] = month !== prevMonth ? MONTHS[month] : undefined
    prevMonth = month
  }

  return (
    <VisSingleContainer sizing={Sizing.Extend}>
      <VisHeatmap<DataRecord>
        data={data}
        value={d => d.count || undefined}
        numRows={NUM_ROWS}
        offset={offset}
        cellSize={14}
        cellPadding={3}
        cellCornerRadius={3}
        columnLabel={column => monthLabels[column]}
        rowLabel={row => WEEKDAYS[row]}
        duration={props.duration}
      />
    </VisSingleContainer>
  )
}
