import React from 'react'
import { ResponsiveNetwork } from '@nivo/network'

import { GraphData, NodeDatum, groups, formatLatency, formatAlerts } from './data'

// Network nodes are black by default, so we take the colors of Nivo's default `nivo` scheme
const colors = ['#e8c1a0', '#f47560', '#f1e15b', '#e8a838', '#61cdbb']

export default function NivoGraph ({ data, isDark }: { data: GraphData; isDark: boolean }): JSX.Element {
  return (
    <ResponsiveNetwork
      data={data}
      margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
      linkDistance={50}
      repulsivity={12}
      centeringStrength={0.4}
      nodeSize={14}
      activeNodeSize={22}
      nodeColor={(n: NodeDatum) => colors[groups.findIndex(g => g.key === n.group)]}
      linkThickness={link => 1 + link.data.requests / 250}
      nodeTooltip={({ node }) => (
        // The default tooltip shows the node id, so we render the label ourselves
        <div style={{ padding: '4px 8px', borderRadius: 4, background: isDark ? '#222' : '#fff', color: isDark ? '#ccc' : '#333' }}>
          <b>{node.data.label}</b><br/>
          {groups.find(g => g.key === node.data.group)?.label}<br/>
          {formatLatency(node.data.latency)}
          {node.data.alerts > 0 && <><br/>{formatAlerts(node.data.alerts)}</>}
        </div>
      )}
    />
  )
}
