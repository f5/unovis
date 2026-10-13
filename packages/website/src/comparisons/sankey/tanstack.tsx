import React, { useMemo } from 'react'
import { Chart } from '@tanstack/charts/react'
import { defineChart, link, rect, text } from '@tanstack/charts'
import { d3Curve } from '@tanstack/charts/d3/shape'
import { sankeyDiagram } from '@tanstack/charts/network/sankey'
import { curveBumpX } from 'd3-shape'
import { tooltip } from '@tanstack/charts/tooltip'

import { COMPARISON_TALL_CHART_HEIGHT } from '../constants'
import { SankeyData, formatVisits } from './data'

// Links are straight by default; like TanStack's own Sankey examples, the S-curves come from d3-shape through `d3Curve()`
const bumpX = d3Curve(curveBumpX)

export default function TanStackSankey ({ data }: { data: SankeyData }): JSX.Element {
  const definition = useMemo(() => defineChart({
    marks: [
      // The Sankey layout hands its nodes and links, already in pixels, to ordinary marks that draw them
      sankeyDiagram({
        nodes: data.nodes,
        links: data.links,
        nodeKey: 'id',
        source: 'source',
        target: 'target',
        value: 'value',
        nodePadding: 12,
        marks: ({ nodes, links }) => [
          // Links and nodes are painted with the same opaque palette color by default, so the links are made translucent
          link(links, {
            x1: 'x1',
            y1: 'y1',
            x2: 'x2',
            y2: 'y2',
            key: 'key',
            strokeWidth: l => Math.max(1, l.width),
            strokeOpacity: 0.35,
            lineCap: 'butt',
            curve: bumpX,
          }),
          rect(nodes, { x1: 'x0', x2: 'x1', y1: 'y0', y2: 'y1', key: 'key', inset: 0 }),
          // Labels on the inner side of the nodes: right of every column except the last one
          text(nodes, {
            x: n => n.height === 0 ? n.x0 - 6 : n.x1 + 6,
            y: 'y',
            text: n => n.data.label,
            anchor: n => n.height === 0 ? 'end' : 'start',
            key: 'key',
          }),
        ] as const,
      }),
    ],
    scales: { x: null, y: null },
    guides: false,
    tooltip: {
      use: tooltip,
      format: ({ datum }) => datum.kind === 'link'
        ? `${datum.sourceNode.data.label} → ${datum.targetNode.data.label}: ${formatVisits(datum.value)}`
        : `${datum.data.label}: ${formatVisits(datum.value)}`,
    },
    svgAnimation: true,
  }), [data])

  return <Chart definition={definition} height={COMPARISON_TALL_CHART_HEIGHT} ariaLabel="Website visitor flows"/>
}
