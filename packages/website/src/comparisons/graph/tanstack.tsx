import React, { useMemo, useState } from 'react'
import { Chart } from '@tanstack/charts/react'
import { defineChart, dot, link, text } from '@tanstack/charts'
import { decorative } from '@tanstack/charts/mark/decorative'
import { interactiveColorLegend } from '@tanstack/charts/legend'
import { controlledSignal } from '@tanstack/charts/interaction/signal'
import { forceLayout } from '@tanstack/charts/network/force'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'

import { COMPARISON_GRAPH_CHART_HEIGHT } from '../constants'
import { GraphData, NodeGroup, groups, formatRequests, formatLatency, formatAlerts } from './data'

const groupLabel = (group: NodeGroup): string => groups.find(g => g.key === group)?.label ?? group

export default function TanStackGraph ({ data }: { data: GraphData }): JSX.Element {
  const [visibleGroups, setVisibleGroups] = useState<readonly NodeGroup[]>(groups.map(g => g.key))

  // `forceLayout` runs a fixed number of D3 force ticks up front on copies of the rows and returns settled coordinates:
  // there's no live simulation, so nodes can't be dragged
  const graph = useMemo(() => forceLayout(data.nodes, data.links, {
    nodeKey: 'id',
    source: 'source',
    target: 'target',
    forces: [
      { type: 'link', distance: 40 },
      { type: 'manyBody', strength: -200 },
      { type: 'center' },
      // A large collision radius leaves room for the two-line labels
      { type: 'collide', radius: 40 },
    ],
  }), [data])

  const definition = useMemo(() => {
    // The legend only proposes the visible groups: links and labels aren't color series, so the hidden groups are filtered out of every mark here
    const nodes = graph.nodes.filter(n => visibleGroups.includes(n.group))
    const links = graph.links.filter(l => visibleGroups.includes(l.sourceNode.group) && visibleGroups.includes(l.targetNode.group))

    return defineChart({
      marks: [
        // Without a color, links take the first palette color, the same as the Clients group, so they get a faded text color instead
        link(links, {
          x1: 'x1',
          y1: 'y1',
          x2: 'x2',
          y2: 'y2',
          key: l => `${l.source}->${l.target}`,
          strokeWidth: l => 1 + l.requests / 250,
          stroke: 'currentColor',
          strokeOpacity: 0.3,
        }),
        dot(nodes, { x: 'x', y: 'y', key: 'id', color: 'group', r: 8 }),
        // Labels are plain text marks (sized down from the page's inherited 16 px font); `decorative` keeps them out of the hover and keyboard focus
        decorative(text(nodes, { x: 'x', y: 'y', key: 'id', text: 'label', fontSize: 12, anchor: 'start', dx: 12, dy: -6 })),
        decorative(text(nodes, { x: 'x', y: 'y', key: 'id', text: n => formatLatency(n.latency), fontSize: 12, anchor: 'start', dx: 12, dy: 8 })),
      ],
      // The layout works in its own coordinates, mapped to the chart with the padded domains it returns
      scales: {
        x: { scale: scaleLinear().domain(graph.xDomain) },
        y: { scale: scaleLinear().domain(graph.yDomain) },
      },
      guides: false,
      color: {
        domain: groups.map(g => g.key),
        legend: interactiveColorLegend({ visible: controlledSignal(visibleGroups, setVisibleGroups), format: groupLabel }),
      },
      tooltip: {
        use: tooltip,
        format: ({ datum }) => 'sourceNode' in datum
          ? `${datum.sourceNode.label} → ${datum.targetNode.label}\n${formatRequests(datum.requests)}`
          : [datum.label, groupLabel(datum.group), formatLatency(datum.latency), ...(datum.alerts ? [formatAlerts(datum.alerts)] : [])].join('\n'),
      },
      svgAnimation: true,
    })
  }, [graph, visibleGroups])

  return <Chart definition={definition} height={COMPARISON_GRAPH_CHART_HEIGHT} ariaLabel="Service dependency graph"/>
}
