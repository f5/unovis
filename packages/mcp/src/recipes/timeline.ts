import { z } from 'zod'

import type { Recipe } from './types.js'
import {
  commonInput,
  xyInput,
  dataRecords,
  fieldName,
  assertFieldsExist,
  baseSpec,
  dateTickValues,
  field,
  isNumericField,
  ChartInputError,
} from './shared.js'
import type { DataRecord } from './shared.js'

/** Coerce a raw record value to a time position: numbers pass through,
 * strings are parsed as dates (→ epoch milliseconds) */
const toTime = (value: string | number | boolean | null | undefined): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value !== '') {
    const numeric = Number(value)
    if (!Number.isNaN(numeric)) return numeric
    const time = new Date(value).getTime()
    if (!Number.isNaN(time)) return time
  }
  return NaN
}


/** Calendar-aligned axis tick values (UTC) for a time extent. Linear-scale
 * ticks land on decimal-nice epoch values (mid-day times), which format as
 * times of day and lose the date — so we pick month/day/hour boundaries
 * instead. Returns undefined for degenerate extents. */
export const timelineInputShape = {
  data: dataRecords,
  row: fieldName().describe('Field with the row (lane) name. Records sharing a row value are drawn in one lane'),
  start: fieldName().describe('Field with the item start: a number, or a date string (e.g. "2024-03-01")'),
  end: fieldName().optional()
    .describe('Field with the item end, same format as start. Provide either end or duration'),
  duration: fieldName().optional()
    .describe('Field with the item duration, in the same units as start (milliseconds when start is a date). Ignored when end is provided'),
  timeIsDate: z.boolean().optional()
    .describe('Treat start/end values as dates (time axis). Auto-detected from the start field when omitted'),
  showRowLabels: z.boolean().default(true).describe('Show the row names on the left'),
  rowHeight: z.number().min(10).max(100).default(22).describe('Row height in pixels'),
  lineWidth: z.number().min(1).max(60).optional()
    .describe('Thickness of the timeline bars in pixels. Defaults to a value derived from rowHeight'),
  roundedEnds: z.boolean().default(false).describe('Draw the bars with rounded ends'),
  alternatingRowColors: z.boolean().default(true).describe('Alternate the row background colors'),
  xAxisLabel: xyInput.xAxisLabel,
  showGridLines: xyInput.showGridLines,
  ...commonInput,
}

export const timelineRecipe: Recipe<typeof timelineInputShape> = {
  name: 'generate_timeline_chart',
  title: 'Timeline chart',
  description: 'Generate a timeline (Gantt-style) chart of items with a start and an end (or duration), grouped into labeled rows. ' +
    'Use for schedules, project plans, traces, or event durations. Provide either an end field or a duration field. ' +
    'Example: data=[{"task":"Design","from":"2024-01-08","to":"2024-02-02"},...], row="task", start="from", end="to".',
  inputShape: timelineInputShape,
  toSpec: (input) => {
    const data = input.data as DataRecord[]
    if (!input.end && !input.duration) {
      throw new ChartInputError('Either "end" or "duration" must be provided')
    }
    assertFieldsExist(data, [input.row, input.start, input.end, input.duration])

    const isDate = input.timeIsDate ?? !isNumericField(data, input.start)

    // Normalize into flat numeric positions: start (epoch ms for dates) and
    // duration (end - start when an end field is given). A synthetic id keeps
    // items distinct even when a row has two items starting at the same time.
    const normalized = data.map((d, i) => {
      const start = isDate ? toTime(d[input.start]) : Number(d[input.start])
      if (!Number.isFinite(start)) {
        throw new ChartInputError(`Invalid "${input.start}" value in record ${i}: ${JSON.stringify(d[input.start])}`)
      }
      let duration: number
      if (input.end) {
        const end = isDate ? toTime(d[input.end]) : Number(d[input.end])
        if (!Number.isFinite(end)) {
          throw new ChartInputError(`Invalid "${input.end}" value in record ${i}: ${JSON.stringify(d[input.end])}`)
        }
        duration = end - start
      } else {
        duration = Number(d[input.duration as string])
      }
      if (!Number.isFinite(duration) || duration < 0) {
        throw new ChartInputError(`Record ${i} has an invalid or negative duration: ${JSON.stringify(duration)}`)
      }
      return {
        ...d,
        _id: `item-${i}`,
        _row: d[input.row] === null || d[input.row] === undefined ? 'Unknown' : String(d[input.row]),
        _start: start,
        _duration: duration,
      }
    })

    // Calendar-aligned ticks for date axes: default linear ticks land on
    // decimal-nice epoch values, which format as times of day.
    let tickValues: number[] | undefined
    if (isDate) {
      const min = Math.min(...normalized.map(d => d._start))
      const max = Math.max(...normalized.map(d => d._start + d._duration))
      tickValues = dateTickValues(min, max)
    }

    return {
      container: 'xy',
      ...baseSpec(input),
      components: [{
        type: 'Timeline',
        config: {
          id: { $field: '_id' },
          x: field('_start', 'number'),
          lineRow: { $field: '_row' },
          lineDuration: field('_duration', 'number'),
          showRowLabels: input.showRowLabels,
          rowMaxLabelWidth: Math.max(120, Math.round(input.width * 0.2)),
          rowHeight: input.rowHeight,
          ...(input.lineWidth !== undefined ? { lineWidth: input.lineWidth } : {}),
          lineCap: input.roundedEnds,
          showEmptySegments: true,
          alternatingRowColors: input.alternatingRowColors,
        },
      }],
      xAxis: {
        label: input.xAxisLabel,
        gridLine: input.showGridLines,
        tickFormat: isDate ? { $dateTickFormat: true } : { $numTickFormat: true },
        ...(tickValues ? { tickValues } : {}),
      },
      data: normalized,
    }
  },
}
