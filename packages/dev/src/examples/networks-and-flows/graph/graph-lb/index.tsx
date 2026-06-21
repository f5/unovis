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

// ─── Node / Link types ────────────────────────────────────────────────────────
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

// ─── Static graph data ────────────────────────────────────────────────────────

// Customer assignments per business unit
const TOTAL_CUSTOMERS = 260
const TOTAL_BUSINESS_UNITS = 20
const CUSTOMERS_PER_BUSINESS_UNIT = TOTAL_CUSTOMERS / TOTAL_BUSINESS_UNITS
const ALL_CUSTOMER_IDS = Array.from({ length: TOTAL_CUSTOMERS }, (_, i) => `customer-${i + 1}`)
const ALL_BUSINESS_UNIT_IDS = Array.from({ length: TOTAL_BUSINESS_UNITS }, (_, i) => `business-unit-${i + 1}`)

const getBusinessUnitIdForCustomer = (customerId: string): string => {
  const customerIndex = Number(customerId.split('-')[1]) - 1
  const businessUnitIndex = Math.floor(customerIndex / CUSTOMERS_PER_BUSINESS_UNIT)
  return `business-unit-${Math.min(businessUnitIndex + 1, TOTAL_BUSINESS_UNITS)}`
}

// All collapsible ids — used for expand/collapse all buttons
const COLLAPSIBLE_IDS = ['customers', ...ALL_BUSINESS_UNIT_IDS, ...ALL_CUSTOMER_IDS, 'blob1']

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

  // ── Customers aggregator (collapsible) ───────────────────────────────────────
  {
    id: 'customers',
    icon: '#roleIcon',
    fillColor: '#8777D9',
    label: 'Customers',
    expandable: true,
    childIds: [...ALL_CUSTOMER_IDS],
  },

  // ── Customer nodes ────────────────────────────────────────────────────────────
  ...ALL_CUSTOMER_IDS.map((id, i) => ({
    id,
    icon: '#personIcon',
    fillColor: '#E6E9F3',
    label: `Customer ${i + 1}`,
    expandable: true,
    childIds: id === 'customer-1'
      ? ['blob1']
      : [getBusinessUnitIdForCustomer(id)],
  })),

  // ── Extra child node for Customer 1 ─────────────────────────────────────────
  {
    id: 'blob1',
    icon: '#bucketIcon',
    fillColor: '#FFD8A8',
    label: 'Blob 1',
    expandable: true,
    childIds: ['business-unit-2'],
  },

  // ── Business units (collapsible — children: Server 1 & Server 2) ─────────────
  ...ALL_BUSINESS_UNIT_IDS.map((id, i) => ({
    id,
    icon: '#bucketIcon',
    fillColor: '#D4DBFB',
    label: `Business Unit ${i + 1}`,
    expandable: true,
    childIds: [`bu${i + 1}-server1`, `bu${i + 1}-server2`],
  })),

  // ── Server nodes (leaf) ───────────────────────────────────────────────────────
  ...ALL_BUSINESS_UNIT_IDS.flatMap((_id, i) => ([
    { id: `bu${i + 1}-server1`, icon: '#instanceIcon', fillColor: '#B2DFDB', label: 'Server 1', expandable: false },
    { id: `bu${i + 1}-server2`, icon: '#instanceIcon', fillColor: '#B2DFDB', label: 'Server 2', expandable: false },
  ])),
]

const links: FlowLink[] = [
  // Fixed backbone chain
  { source: 'api-gateway', target: 'auth' },
  { source: 'auth', target: 'compliance' },
  { source: 'compliance', target: 'firewall' },
  { source: 'firewall', target: 'customers' },

  // Customers aggregator → each customer node
  ...ALL_CUSTOMER_IDS.map(id => ({ source: 'customers', target: id })),

  // Customer nodes → assigned business units (except Customer 1, routed through Blob 1)
  ...ALL_CUSTOMER_IDS
    .filter(id => id !== 'customer-1')
    .map(id => ({ source: id, target: getBusinessUnitIdForCustomer(id) })),

  // Customer 1 extra child path
  { source: 'customer-1', target: 'blob1' },
  { source: 'blob1', target: 'business-unit-2' },

  // Business unit → server nodes
  ...ALL_BUSINESS_UNIT_IDS.flatMap((_id, i) => ([
    { source: `business-unit-${i + 1}`, target: `bu${i + 1}-server1` },
    { source: `business-unit-${i + 1}`, target: `bu${i + 1}-server2` },
  ])),
]

const graphData = { nodes, links }

// ─── Component ────────────────────────────────────────────────────────────────
export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const graphRef = useRef<VisGraphRef<FlowNode, FlowLink>>(null)
  const [expanded, setExpanded] = useState(false)
  const [layoutDirection, setLayoutDirection] = useState<'LR' | 'TB'>('LR')
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
        <button
          onClick={() => setLayoutDirection(layoutDirection === 'LR' ? 'TB' : 'LR')}
          style={{ padding: '8px 16px', cursor: 'pointer', borderRadius: 4, border: '1px solid #aaa' }}
        >
          {layoutDirection === 'LR' ? 'Top to Bottom' : 'Left to Right'}
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
          layoutType={layoutDirection === 'LR' ? 'parallel' : 'parallel horizontal'}
          layoutNodeGroup={(n) => {
            if (n.id === 'auth') return 'layer-1'
            if (n.id === 'compliance') return 'layer-2'
            if (n.id === 'firewall') return 'layer-3'
            if (n.id === 'customers') return 'layer-4'
            if (ALL_CUSTOMER_IDS.includes(n.id)) return 'layer-5a'
            if (n.id === 'blob1') return 'layer-5d'
            if (n.id.startsWith('business-unit-')) return 'layer-6'
            if (n.id.includes('-server')) return 'layer-7'
            return 'other'
          }}
          layoutGroupOrder={['layer-1', 'layer-2', 'layer-3', 'layer-4', 'layer-5a', 'layer-5b', 'layer-5c', 'layer-5d', 'layer-6', 'layer-7']}
          layoutParallelNodesPerColumn={30}
          layoutParallelNodeSpacing={140}
          layoutParallelGroupSpacing={140}
          nodeExpandable={n => n.expandable}
          nodeChildren={n => n.childIds ?? []}
          linkCurvature={1}
          duration={props.duration}
        />
      </VisSingleContainer>
    </div>
  )
}
