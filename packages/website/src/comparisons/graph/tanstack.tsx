import React, { useMemo, useState } from 'react'
import { Chart } from '@tanstack/charts/react'
import { defineChart, dot, link, text } from '@tanstack/charts'
import { decorative } from '@tanstack/charts/mark/decorative'
import { interactiveColorLegend } from '@tanstack/charts/legend'
import { controlledSignal } from '@tanstack/charts/interaction/signal'
import { forceLayout } from '@tanstack/charts/network/force'
import { sankeyDiagram } from '@tanstack/charts/network/sankey'
import { forceRadial } from 'd3-force'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'

import { COMPARISON_GRAPH_CHART_HEIGHT } from '../constants'
import type { ChartProps } from '../types'
import { GraphData, NodeDatum, NodeGroup, groups, formatRequests, formatLatency, formatAlerts } from './data'

const groupLabel = (group: NodeGroup): string => groups.find(g => g.key === group)?.label ?? group
const nodeTooltip = (n: NodeDatum): string => [n.label, groupLabel(n.group), formatLatency(n.latency), ...(n.alerts ? [formatAlerts(n.alerts)] : [])].join('\n')

export default function TanStackGraph ({ data, preset }: ChartProps<GraphData>): JSX.Element {
  const [visibleGroups, setVisibleGroups] = useState<readonly NodeGroup[]>(groups.map(g => g.key))
  const circular = preset === 'circular'

  // `forceLayout` runs a fixed number of D3 force ticks up front on copies of the rows and returns settled coordinates:
  // there's no live simulation, so nodes can't be dragged
  const graph = useMemo(() => forceLayout(data.nodes, data.links, {
    nodeKey: 'id',
    source: 'source',
    target: 'target',
    forces: circular
      ? [
        { type: 'manyBody', strength: -200 },
        { type: 'center' },
        // There's no circular layout, but `forceLayout` takes any D3 force: without the link force, D3's radial force spreads the nodes on a ring
        { type: 'custom', name: 'radial', create: () => forceRadial(100).strength(1) },
      ]
      : [
        { type: 'link', distance: 40 },
        { type: 'manyBody', strength: -200 },
        { type: 'center' },
        // A large collision radius leaves room for the two-line labels
        { type: 'collide', radius: 40 },
      ],
  }), [data, circular])

  const definition = useMemo(() => {
    const r = (n: NodeDatum): number => preset === 'size' ? 3 + n.latency / 20 : 8
    const color = {
      domain: groups.map(g => g.key),
      legend: interactiveColorLegend({ visible: controlledSignal(visibleGroups, setVisibleGroups), format: groupLabel }),
    }

    if (preset === 'layered') {
      // There's no layered graph layout, but the Sankey layout puts every node in a column to the right of its sources.
      // It lays out bars sized by flow, so the dots, links and labels are drawn over the centers of its nodes
      const layout = {
        nodes: data.nodes,
        links: data.links,
        nodeKey: 'id',
        source: 'source',
        target: 'target',
        // Equal weights, so the traffic doesn't change the spacing of the nodes
        value: () => 1,
        align: 'left',
        nodeWidth: 1,
        nodePadding: 24,
        inset: { top: 20, right: 120, bottom: 20, left: 16 },
      } as const
      // The hidden groups are filtered out after the layout: a filtered graph could be left without links, which the layout rejects
      const isShown = (n: { data: NodeDatum }): boolean => visibleGroups.includes(n.data.group)

      return defineChart({
        marks: [
          sankeyDiagram({
            ...layout,
            marks: ({ nodes, links }) => [
              link(links.filter(l => isShown(l.sourceNode) && isShown(l.targetNode)), {
                x1: l => l.sourceNode.x,
                y1: l => l.sourceNode.y,
                x2: l => l.targetNode.x,
                y2: l => l.targetNode.y,
                key: 'key',
                strokeWidth: l => 1 + l.data.requests / 250,
                stroke: 'currentColor',
                strokeOpacity: 0.3,
              }),
              dot(nodes.filter(isShown), { x: 'x', y: 'y', key: 'key', color: n => n.data.group, r: n => r(n.data) }),
            ] as const,
          }),
          // `decorative` can't wrap a mark inside the layout, so the labels get a copy of the layout of their own
          decorative(sankeyDiagram({
            ...layout,
            marks: ({ nodes }) => [
              text(nodes.filter(isShown), { x: 'x', y: 'y', key: 'key', text: n => n.data.label, fontSize: 12, anchor: 'start', dx: n => r(n.data) + 4, dy: -6 }),
              text(nodes.filter(isShown), { x: 'x', y: 'y', key: 'key', text: n => formatLatency(n.data.latency), fontSize: 12, anchor: 'start', dx: n => r(n.data) + 4, dy: 8 }),
            ] as const,
          })),
        ],
        scales: { x: null, y: null },
        guides: false,
        color,
        tooltip: {
          use: tooltip,
          format: ({ datum }) => datum.kind === 'link'
            ? `${datum.sourceNode.data.label} → ${datum.targetNode.data.label}\n${formatRequests(datum.data.requests)}`
            : nodeTooltip(datum.data),
        },
        svgAnimation: true,
      })
    }

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
        dot(nodes, { x: 'x', y: 'y', key: 'id', color: 'group', r }),
        // Labels are plain text marks (sized down from the page's inherited 16 px font); `decorative` keeps them out of the hover and keyboard focus
        decorative(text(nodes, { x: 'x', y: 'y', key: 'id', text: 'label', fontSize: 12, anchor: 'start', dx: n => r(n) + 4, dy: -6 })),
        decorative(text(nodes, { x: 'x', y: 'y', key: 'id', text: n => formatLatency(n.latency), fontSize: 12, anchor: 'start', dx: n => r(n) + 4, dy: 8 })),
      ],
      // The layout works in its own coordinates, mapped to the chart with the padded domains it returns
      scales: {
        x: { scale: scaleLinear().domain(graph.xDomain) },
        y: { scale: scaleLinear().domain(graph.yDomain) },
      },
      guides: false,
      color,
      tooltip: {
        use: tooltip,
        format: ({ datum }) => 'sourceNode' in datum
          ? `${datum.sourceNode.label} → ${datum.targetNode.label}\n${formatRequests(datum.requests)}`
          : nodeTooltip(datum),
      },
      svgAnimation: true,
    })
  }, [data, graph, visibleGroups, preset])

  return <Chart definition={definition} height={COMPARISON_GRAPH_CHART_HEIGHT} ariaLabel="Service dependency graph"/>
}
