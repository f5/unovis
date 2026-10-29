import React, { useEffect, useRef, useState } from 'react'
import { VegaEmbed } from 'react-vega'
import type { TopLevelSpec } from 'vega-lite'
import type { EmbedOptions, Result } from 'vega-embed'

import type { ChartProps } from '../types'
import { LAST_30_DAYS, READOUT_STYLE } from './constants'
import { DataRecord, formatDate, formatDay, formatMonth, formatSelection, formatValue } from './data'

// Vega-Lite formats with d3-format strings: the data.ts formatters are registered as Vega expression functions and
// used as custom format types. Temporal values reach them as dates in the tooltip and as timestamps on the axes
const expressionFunctions = {
  formatDate: (date: Date | number): string => formatDate(new Date(date)),
  formatDay: (date: Date | number): string => formatDay(new Date(date)),
  formatMonth: (date: Date | number): string => formatMonth(new Date(date)),
  formatValue,
}
// Room for the y axis labels, which concatenated views draw outside their width
const AXIS_WIDTH = 50
const toDateTime = (date: Date): { year: number; month: number; date: number } => ({ year: date.getFullYear(), month: date.getMonth() + 1, date: date.getDate() })

export default function VegaLiteBrushChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const [range, setRange] = useState<[number, number] | undefined>()
  // `width: 'container'` only fits single and layered views: in a vconcat the axes and padding overflow it, so the
  // demo measures the card and gives both views an explicit width
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState<number>()

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width) - AXIS_WIDTH))
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    setRange(preset === 'window' ? [+LAST_30_DAYS[0], +LAST_30_DAYS[1]] : undefined)
  }, [preset])

  // The interval selection is a Vega signal: `{ date: [start, end] }` while there's a selection, `{}` without one
  const onEmbed = ({ view }: Result): void => {
    view.addSignalListener('brush', (_, value: { date?: [number, number] }) => setRange(value.date ? [+value.date[0], +value.date[1]] : undefined))
  }

  const spec: TopLevelSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
    // The dark theme paints its own background
    background: 'transparent',
    config: { customFormatTypes: true },
    // Recharts freezes the rows every demo shares, and Vega-Lite adds ids to them, so it gets copies
    data: { values: data.map(d => ({ ...d })) },
    vconcat: [
      {
        width,
        height: 270,
        // The main chart's x domain is the brushed range, as in Vega-Lite's overview + detail example
        encoding: { x: { field: 'date', type: 'temporal', title: null, scale: { domain: { param: 'brush' } }, axis: { formatType: 'formatDay' } } },
        layer: [
          { mark: 'area', encoding: { y: { field: 'requests', type: 'quantitative', title: null, axis: { formatType: 'formatValue' } } } },
          {
            // A tooltip for the nearest day, on an invisible rule the pointer reveals
            mark: { type: 'rule', color: isDark ? 'white' : undefined },
            params: [{ name: 'hover', select: { type: 'point', fields: ['date'], nearest: true, on: 'pointerover', clear: 'pointerout' } }],
            encoding: {
              opacity: { condition: { param: 'hover', value: 0.3, empty: false }, value: 0 },
              tooltip: [
                { field: 'date', type: 'temporal', title: 'Day', formatType: 'formatDate' },
                { field: 'requests', type: 'quantitative', title: 'Requests', formatType: 'formatValue' },
              ],
            },
          },
        ],
      },
      {
        width,
        height: 60,
        mark: 'area',
        // Drag to select a range, drag the selection to move it, scroll over it to resize it
        params: [{
          name: 'brush',
          select: { type: 'interval', encodings: ['x'] },
          ...(preset === 'window' && { value: { x: LAST_30_DAYS.map(toDateTime) } }),
        }],
        encoding: {
          x: { field: 'date', type: 'temporal', title: null, axis: { formatType: 'formatMonth' } },
          y: { field: 'requests', type: 'quantitative', title: null, axis: null },
        },
      },
    ],
  }

  const options: EmbedOptions = { actions: false, theme: isDark ? 'dark' : undefined, tooltip: { theme: isDark ? 'dark' : 'light' }, expressionFunctions }

  return (
    <div ref={ref}>
      <div style={READOUT_STYLE}>{formatSelection(data, range)}</div>
      {width > 0 && <VegaEmbed spec={spec} options={options} onEmbed={onEmbed}/>}
    </div>
  )
}
