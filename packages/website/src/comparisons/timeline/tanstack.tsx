import React, { useMemo, useState } from 'react'
import { arrow, defineChart, rect } from '@tanstack/charts'
import { Chart } from '@tanstack/charts/react'
import { controlledSignal } from '@tanstack/charts/interaction/signal'
import { interactiveColorLegend } from '@tanstack/charts/legend'
import { scaleBand } from '@tanstack/charts/scales/band'
import { tooltip } from '@tanstack/charts/tooltip'
import { scaleTime } from 'd3-scale'

import { COMPARISON_CHART_HEIGHT } from '../constants'
import type { ChartProps } from '../types'
import { DAY, WEEK_END, WEEK_START } from './constants'
import { TimelineEvent, kinds, services, formatDay, formatRange, getKindLabel } from './data'

const days = Array.from({ length: 8 }, (_, i) => new Date(WEEK_START + i * DAY))

export default function TanStackTimeline ({ data, preset }: ChartProps<TimelineEvent[]>): JSX.Element {
  const [visible, setVisible] = useState<readonly string[]>(kinds.map(k => k.label))

  const definition = useMemo(() => {
    const rows = data.map(d => ({ ...d, kindLabel: getKindLabel(d.kind) }))
    // Its legend hides a kind's rectangles but no other marks, so the arrows to hidden items are filtered here
    const shown = rows.filter(d => visible.includes(d.kindLabel))
    const links = shown.flatMap(d => {
      const cause = shown.find(c => c.id === d.causeId)
      return cause ? [{ x1: cause.end, y1: cause.service, x2: d.start, y2: d.service }] : []
    })

    return defineChart({
      marks: [
        rect(rows, { x1: 'start', x2: 'end', y: 'service', color: 'kindLabel', key: 'id', radius: preset === 'rounded' ? 999 : undefined }),
        ...(preset === 'arrows' ? [arrow(links, { x1: 'x1', y1: 'y1', x2: 'x2', y2: 'y2', stroke: 'currentColor' })] : []),
      ],
      scales: {
        // TanStack Charts has no time scale of its own, its docs use d3-scale's. A scale instance keeps its domain
        x: { scale: scaleTime().domain([WEEK_START, WEEK_END]), axis: { ticks: { values: days, format: (day: Date) => formatDay(+day) } } },
        // The band scale has no padding by default, the rows would touch
        y: { scale: scaleBand<string>().domain(services).padding(0.2) },
      },
      color: {
        domain: kinds.map(k => k.label),
        legend: interactiveColorLegend({ visible: controlledSignal(visible, setVisible) }),
      },
      tooltip: { use: tooltip, format: ({ datum }) => 'title' in datum ? `${datum.title}\n${datum.service} · ${datum.kindLabel}\n${formatRange(datum)}` : '' },
      svgAnimation: true,
    })
  }, [data, preset, visible])

  return <Chart definition={definition} height={COMPARISON_CHART_HEIGHT} ariaLabel="Deployments, incidents and maintenance windows per service"/>
}
