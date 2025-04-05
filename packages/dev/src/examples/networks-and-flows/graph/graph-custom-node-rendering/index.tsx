import React, { useCallback, useMemo, useRef, useState } from 'react'
import { GraphFitViewAlignment, GraphLink, GraphNode } from '@unovis/ts'
import type { VisGraphRef } from '@unovis/react'

import { CustomGraph } from './component'
import { CustomGraphNodeType } from './enums'
import type { CustomGraphLink, CustomGraphNode } from './types'

import * as s from './styles'

export const title = 'Graph: Custom Nodes'
export const subTitle = 'User provided rendering functions'

export const component = (): JSX.Element => {
  const [showLinkFlow, setShowLinkFlow] = useState(true)
  const [fitViewAlignment, setFitViewAlignment] = useState<GraphFitViewAlignment>(GraphFitViewAlignment.Center)
  const graphRef = useRef<VisGraphRef<CustomGraphNode, CustomGraphLink> | null>(null)

  const nodes: CustomGraphNode[] = useMemo(() => ([
    {
      id: '0',
      type: CustomGraphNodeType.Identity,
      subLabel: 'External User',
      label: 'jdoe@acme.com',
      aggregationCount: 2,
      numFindings: { medium: 12, high: 3, critical: 1 },
      starred: true,
      numSessions: 150,
      status: ['admin', 'high-data-access'],
    },
    { id: '1', type: CustomGraphNodeType.Identity, subLabel: 'Role', label: 'AWSReservedSSO_Something' },
    { id: '2', type: CustomGraphNodeType.Network, subLabel: 'EC2 Instance', label: 'i-0a1b2c3d4e5f6g7h8' },
    { id: '3', type: CustomGraphNodeType.Network, subLabel: 'EC2 Instance', label: 'i-1a1b2c3d4e5f6g7h8' },
    { id: '4', type: CustomGraphNodeType.Resource, subLabel: 'File', label: 'my-file' },
    { id: '5', type: CustomGraphNodeType.Secret, subLabel: 'Secret', label: 'tests-ansible-ssm-file-transfer' },
  ]), [])

  const links: CustomGraphLink[] = useMemo(() => ([
    { source: '0', target: '1', showFlow: true, linkFlowParticleSize: 1.5, linkFlowParticleSpeed: 15 },
    { source: '0', target: '2', showFlow: true, linkFlowParticleSize: 2, linkFlowParticleSpeed: 25 },
    { source: '0', target: '3', showFlow: true, linkFlowParticleSize: 3, linkFlowParticleSpeed: 10 },
    { source: '0', target: '4', showFlow: true, linkFlowParticleSize: 3, linkFlowParticleSpeed: 30 },
    { source: '1', target: '5', showFlow: true, linkFlowParticleSize: 2.5, linkFlowParticleSpeed: 20 },
  ]), [])

  // Modifying layout after the calculation
  const onLayoutCalculated = useCallback((nodes: GraphNode<CustomGraphNode, CustomGraphLink>[], links: GraphLink<CustomGraphNode, CustomGraphLink>[]) => {
    nodes[0].x = 100
  }, [])


  const fitView = useCallback((nodeIds?: string[]) => {
    graphRef.current?.component?.fitView(undefined, nodeIds)
  }, [])

  return (
    <>
      <CustomGraph
        ref={graphRef}
        nodes={nodes}
        links={links}
        height={'100vh'}
        linkFlow={useCallback((l: CustomGraphLink) => showLinkFlow && l.showFlow, [showLinkFlow])}
        onLayoutCalculated={onLayoutCalculated}
        linkFlowAnimDuration={useCallback((l: CustomGraphLink) => l.linkFlowAnimDuration, [])}
        linkFlowParticleSpeed={useCallback((l: CustomGraphLink) => l.linkFlowParticleSpeed, [])}
        linkFlowParticleSize={useCallback((l: CustomGraphLink) => l.linkFlowParticleSize, [])}
        linkWidth={0}
        linkBandWidth={useCallback((l: CustomGraphLink) => 2 * (l.linkFlowParticleSize ?? 1), [])}
        fitViewAlign={fitViewAlignment}
        fitViewPadding={useMemo(() => ({ top: 50, right: 50, bottom: 100, left: 50 }), [])}
      />
      <div className={s.checkboxContainer}>
        <label>
          <input
            type="checkbox"
            checked={showLinkFlow}
            onChange={(e) => setShowLinkFlow(e.target.checked)}
          />
          Show Link Flow
        </label>
        <select
          value={fitViewAlignment}
          onChange={(e) => setFitViewAlignment(e.target.value as GraphFitViewAlignment)}
          className={s.graphButton}
        >
          {Object.values(GraphFitViewAlignment).map((alignment) => (
            <option key={alignment} value={alignment}>
              {alignment.charAt(0).toUpperCase() + alignment.slice(1)}
            </option>
          ))}
        </select>
        <button className={s.graphButton} onClick={() => fitView(['0', '1', '2', '3'])}>Zoom To Identity and Network Nodes</button>
        <button className={s.graphButton} onClick={() => fitView()}>Fit Graph</button>
      </div>
    </>
  )
}

