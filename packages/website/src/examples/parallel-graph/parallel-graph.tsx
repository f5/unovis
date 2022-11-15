import React, { useCallback, useMemo } from 'react'
import { VisSingleContainer, VisGraph } from '@unovis/react'
import { Graph, GraphLayoutType } from '@unovis/ts'

import { nodes, links, sites, StatusMap, NodeDatum, LinkDatum } from './data'

import './styles.css'

const mainSite = nodes[0].site

export default function ParallelGraph (): JSX.Element {
  const [expanded, setExpanded] = React.useState([mainSite])

  const data = useMemo(() => ({
    nodes: nodes.flatMap<NodeDatum>(n => expanded.includes(n.site) ? (n.children as NodeDatum[]) : n),
    links: links.map(l => ({
      ...l,
      source: expanded.includes(l.sourceGroup) ? l.source : sites[l.sourceGroup].groupNodeId,
      target: expanded.includes(l.targetGroup) ? l.target : sites[l.targetGroup].groupNodeId,
    })),
  }), [expanded])

  const panels = useMemo(() => expanded.map(site => sites[site].panel), [expanded])

  return (
    <div className='chart'>
      <VisSingleContainer data={data} height={'65vh'}>
        <VisGraph<NodeDatum, LinkDatum>
          events={{
            [Graph.selectors.node]: {
              click: (d: NodeDatum) => d.site === mainSite
                ? setExpanded([mainSite])
                : setExpanded([mainSite, d.site]),
            },
          }}
          disableZoom={true}
          layoutType={GraphLayoutType.Parallel}
          layoutGroupOrder={['west', mainSite, 'east']}
          layoutNonConnectedAside={false}
          layoutParallelNodesPerColumn={4}
          nodeStrokeWidth={3}
          nodeIconSize={20}
          nodeSize={useCallback((n: NodeDatum) => n.children ? 75 : 50, [])}
          nodeShape={useCallback((n: NodeDatum) => n.shape, [])}
          nodeGaugeValue={useCallback((n: NodeDatum) => n.score || null, [])}
          nodeGaugeFill={useCallback((n: NodeDatum) => n.status ? StatusMap[n.status]?.color : null, [])}
          nodeSubLabel={useCallback((n: NodeDatum) => n.score ? `${n.score}/100` : '', [])}
          nodeSideLabels={useCallback((n: NodeDatum) => [{
            radius: 16,
            fontSize: 12,
            ...(n.children ? { text: n.children.length } : {}),
            ...(n.status ? StatusMap[n.status] : {}),
          }], [])}
          linkFlow={useCallback((l: LinkDatum) => l.showTraffic, [])}
          linkStroke={useCallback((l: LinkDatum) => StatusMap[l.status]?.color || null, [])}
          linkBandWidth={useCallback((l: LinkDatum) => l.showTraffic ? 12 : 6, [])}
          panels={panels}
        />
      </VisSingleContainer>
    </div>
  )
}

