import React, { useRef, useCallback, useEffect, useState } from 'react'
import { VisSingleContainer, VisGraph, VisGraphRef } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

import personIcon from './person.svg?raw'
import roleIcon from './role.svg?raw'
import instanceIcon from './instance.svg?raw'
import bucketIcon from './bucket.svg?raw'

import s from './index.module.css'

export const title = 'Graph: Expand or collapse'
export const subTitle = 'Interactive expand/collapse example'

type FlowNode = {
  id: string;
  icon: string;
  fillColor: string;
  label: string;
  expandable: boolean;
  childIds?: string[];
}

type FlowLink = {
  source: string;
  target: string;
}

const BU1_CUSTOMER_IDS = ['customer-2', 'customer-3', 'customer-4', 'customer-6']
const BU2_CUSTOMER_IDS = ['customer-1', 'customer-7', 'customer-5', 'customer-8']
const ALL_CUSTOMER_IDS = Array.from({ length: 8 }, (_, i) => `customer-${i + 1}`)

// All collapsible ids — used for expand/collapse all buttons
const COLLAPSIBLE_IDS = ['customers', 'business-unit-1', 'business-unit-2', ...ALL_CUSTOMER_IDS]

const nodes: FlowNode[] = [
  // Fixed backbone (expandable: false — always visible, click does nothing)
  {
    id: 'auth',
    icon: '#roleIcon',
    fillColor: '#3FCDC6',
    label: 'Authentication',
    expandable: false,
  },
  {
    id: 'compliance',
    icon: '#roleIcon',
    fillColor: '#59BCFA',
    label: 'Compliance',
    expandable: false,
  },
  {
    id: 'firewall',
    icon: '#instanceIcon',
    fillColor: '#E0EAFF',
    label: 'Firewall',
    expandable: false,
  },
  {
    id: 'customers',
    icon: '#roleIcon',
    fillColor: '#8777D9',
    label: 'Customers',
    expandable: true,
    childIds: [...ALL_CUSTOMER_IDS],
  },
  ...ALL_CUSTOMER_IDS.map((id, i) => ({
    id,
    icon: '#personIcon',
    fillColor: '#E6E9F3',
    label: `Customer ${i + 1}`,
    expandable: true,
    childIds: BU1_CUSTOMER_IDS.includes(id)
      ? ['business-unit-1']
      : BU2_CUSTOMER_IDS.includes(id)
        ? ['business-unit-2']
        : [],
  })),
  {
    id: 'business-unit-1',
    icon: '#bucketIcon',
    fillColor: '#D4DBFB',
    label: 'Business Unit 1',
    expandable: true,
    childIds: ['bu1-server1', 'bu1-server2'],
  },
  {
    id: 'business-unit-2',
    icon: '#bucketIcon',
    fillColor: '#D4DBFB',
    label: 'Business Unit 2',
    expandable: true,
    childIds: ['bu2-server1', 'bu2-server2'],
  },
  { id: 'bu1-server1', icon: '#instanceIcon', fillColor: '#B2DFDB', label: 'Server 1', expandable: false },
  { id: 'bu1-server2', icon: '#instanceIcon', fillColor: '#B2DFDB', label: 'Server 2', expandable: false },
  { id: 'bu2-server1', icon: '#instanceIcon', fillColor: '#B2DFDB', label: 'Server 1', expandable: false },
  { id: 'bu2-server2', icon: '#instanceIcon', fillColor: '#B2DFDB', label: 'Server 2', expandable: false },
]

const links: FlowLink[] = [
  // Fixed backbone chain
  { source: 'api-gateway', target: 'auth' },
  { source: 'auth', target: 'compliance' },
  { source: 'compliance', target: 'firewall' },
  { source: 'firewall', target: 'customers' },

  // Customers aggregator → each customer node
  ...ALL_CUSTOMER_IDS.map(id => ({ source: 'customers', target: id })),

  // Customer nodes → Business Unit 1
  ...BU1_CUSTOMER_IDS.map(id => ({ source: id, target: 'business-unit-1' })),

  // Customer nodes → Business Unit 2
  ...BU2_CUSTOMER_IDS.map(id => ({ source: id, target: 'business-unit-2' })),

  // Business unit → server nodes
  { source: 'business-unit-1', target: 'bu1-server1' },
  { source: 'business-unit-1', target: 'bu1-server2' },
  { source: 'business-unit-2', target: 'bu2-server1' },
  { source: 'business-unit-2', target: 'bu2-server2' },
]

const graphData = { nodes, links }

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const graphRef = useRef<VisGraphRef<FlowNode, FlowLink>>(null)
  const [expanded, setExpanded] = useState(false)
  const svgDefs = `
    ${personIcon}
    ${roleIcon}
    ${instanceIcon}
    ${bucketIcon}
  `

  useEffect(() => {
    graphRef.current?.component?.setCollapsedNodes(COLLAPSIBLE_IDS)
    requestAnimationFrame(() => graphRef.current?.component?.fitView())
  }, [])

  const handleToggle = useCallback(() => {
    const graph = graphRef.current?.component
    if (!graph) return
    if (expanded) {
      graph.setCollapsedNodes(COLLAPSIBLE_IDS)
    } else {
      graph.setCollapsedNodes([])
    }
    setExpanded(e => !e)
  }, [expanded])

  return (
    <div className={s.graph}>
      <div style={{ margin: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button
          onClick={handleToggle}
          style={{ padding: '8px 16px', cursor: 'pointer', borderRadius: 4, border: '1px solid #aaa' }}
        >
          {expanded ? 'Collapse All' : 'Expand All'}
        </button>
      </div>
      <VisSingleContainer svgDefs={svgDefs} className={s.graphContainer}>
        <VisGraph<FlowNode, FlowLink>
          ref={graphRef as any}
          data={graphData}
          nodeIcon={n => n.icon}
          nodeIconSize={18}
          nodeSize={30}
          nodeStroke='none'
          nodeStrokeWidth={3}
          nodeFill={n => n.fillColor}
          nodeLabel={n => n.label}
          layoutType="dagre"
          dagreLayoutSettings={{ rankdir: 'LR', ranksep: 120, edgesep: 200, nodesep: 120 }}
          nodeExpandable={n => n.expandable}
          nodeChildren={n => n.childIds ?? []}
          linkCurvature={1}
          duration={props.duration}
        />
      </VisSingleContainer>
    </div>
  )
}
