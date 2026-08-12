import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { VisSingleContainer, VisGraph, VisGraphRef } from '@unovis/react'
import { Graph, GraphCircleLabel } from '@unovis/ts'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

// Reuse the icons that already exist in the sibling example
import personIcon from '../graph-lb/person.svg?raw'
import roleIcon from '../graph-lb/role.svg?raw'
import instanceIcon from '../graph-lb/instance.svg?raw'
import bucketIcon from '../graph-lb/bucket.svg?raw'

import s from './index.module.css'

export const title = 'Graph: Drill-down navigation'
export const subTitle = 'UX pattern for large graphs — aggregate, search, drill in'

// ─── Domain constants ────────────────────────────────────────────────────────
const TOTAL_CUSTOMERS = 260
const TOTAL_BUSINESS_UNITS = 20
const CUSTOMERS_PER_BU = TOTAL_CUSTOMERS / TOTAL_BUSINESS_UNITS

const ALL_CUSTOMER_IDS = Array.from({ length: TOTAL_CUSTOMERS }, (_, i) => `customer-${i + 1}`)

const getBUForCustomer = (customerId: string): string => {
  const idx = Number(customerId.split('-')[1]) - 1
  return `business-unit-${Math.min(Math.floor(idx / CUSTOMERS_PER_BU) + 1, TOTAL_BUSINESS_UNITS)}`
}

const SERVERS_PER_BU = 2
const TOTAL_SERVERS = TOTAL_BUSINESS_UNITS * SERVERS_PER_BU

// ─── Node / link types ───────────────────────────────────────────────────────
type NodeKind =
  | 'backbone'
  | 'aggregator-customers'
  | 'aggregator-bu'
  | 'aggregator-server'
  | 'customer'
  | 'bu'
  | 'server'
  | 'other'

type FlowNode = {
  id: string;
  kind: NodeKind;
  icon: string;
  fillColor: string;
  label: string;
  subLabel?: string;
  badge?: number;
  meta?: Record<string, string>;
}

type FlowLink = {
  source: string;
  target: string;
}

// ─── Static reference metadata (used by detail card) ─────────────────────────
const backboneNodes: FlowNode[] = [
  { id: 'auth', kind: 'backbone', icon: '#roleIcon', fillColor: '#3FCDC6', label: 'Authentication', meta: { region: 'us-east-1', status: 'healthy' } },
  { id: 'compliance', kind: 'backbone', icon: '#roleIcon', fillColor: '#59BCFA', label: 'Compliance', meta: { region: 'us-east-1', status: 'healthy' } },
  { id: 'firewall', kind: 'backbone', icon: '#instanceIcon', fillColor: '#E0EAFF', label: 'Firewall', meta: { region: 'us-east-1', status: 'healthy' } },
]

// ─── Data builder ────────────────────────────────────────────────────────────
// The graph is derived from state: the *default* (overview) shape is only 7
// nodes long — user drills in by pinning individual customers from the drawer.
function buildGraph (pinned: Set<string>): { nodes: FlowNode[]; links: FlowLink[] } {
  const nodes: FlowNode[] = [...backboneNodes]
  const links: FlowLink[] = [
    { source: 'auth', target: 'compliance' },
    { source: 'compliance', target: 'firewall' },
  ]

  const pinnedIds = Array.from(pinned).sort((a, b) => (
    Number(a.split('-')[1]) - Number(b.split('-')[1])
  ))

  // The customers aggregator is always visible. Its sub-label reflects
  // how many customers are still "hidden inside" the group.
  const remainingCustomers = TOTAL_CUSTOMERS - pinnedIds.length
  nodes.push({
    id: 'customers-agg',
    kind: 'aggregator-customers',
    icon: '#roleIcon',
    fillColor: '#8777D9',
    label: 'Customers',
    subLabel: pinnedIds.length === 0
      ? `${TOTAL_CUSTOMERS} in group`
      : `${remainingCustomers} more`,
    badge: remainingCustomers,
    meta: { total: String(TOTAL_CUSTOMERS), pinned: String(pinnedIds.length) },
  })
  links.push({ source: 'firewall', target: 'customers-agg' })

  if (pinnedIds.length === 0) {
    // ── Overview mode — three aggregators on the right side ──────────────────
    nodes.push({
      id: 'bu-agg',
      kind: 'aggregator-bu',
      icon: '#bucketIcon',
      fillColor: '#D4DBFB',
      label: 'Business Units',
      subLabel: `${TOTAL_BUSINESS_UNITS} groups`,
      badge: TOTAL_BUSINESS_UNITS,
    })
    nodes.push({
      id: 'server-agg',
      kind: 'aggregator-server',
      icon: '#instanceIcon',
      fillColor: '#B2DFDB',
      label: 'Servers',
      subLabel: `${TOTAL_SERVERS} instances`,
      badge: TOTAL_SERVERS,
    })
    links.push({ source: 'customers-agg', target: 'bu-agg' })
    links.push({ source: 'bu-agg', target: 'server-agg' })
    return { nodes, links }
  }

  // ── Drill mode — expand only pinned customers and their downstream path ───
  const usedBUs = new Set<string>()

  for (const cid of pinnedIds) {
    const cIndex = Number(cid.split('-')[1])
    nodes.push({
      id: cid,
      kind: 'customer',
      icon: '#personIcon',
      fillColor: '#E6E9F3',
      label: `Customer ${cIndex}`,
      subLabel: `#${cIndex.toString().padStart(3, '0')}`,
      meta: { tier: cIndex % 3 === 0 ? 'gold' : 'silver', region: 'us-east-1' },
    })
    // Aggregator → pinned customer (visual proof that the customer came out
    // of the group, not "from nowhere")
    links.push({ source: 'customers-agg', target: cid })

    const bu = getBUForCustomer(cid)

    // Illustrate the "unique middle node" case for customer-1
    if (cid === 'customer-1') {
      nodes.push({
        id: 'blob1',
        kind: 'other',
        icon: '#bucketIcon',
        fillColor: '#FFD8A8',
        label: 'Blob storage',
        subLabel: 'shared bucket',
      })
      links.push({ source: cid, target: 'blob1' })
      links.push({ source: 'blob1', target: bu })
    } else {
      links.push({ source: cid, target: bu })
    }
    usedBUs.add(bu)
  }

  // Business units that we actually need
  for (const bu of usedBUs) {
    const buIndex = Number(bu.split('-').pop())
    nodes.push({
      id: bu,
      kind: 'bu',
      icon: '#bucketIcon',
      fillColor: '#D4DBFB',
      label: `Business Unit ${buIndex}`,
      subLabel: `${CUSTOMERS_PER_BU} customers`,
      meta: { region: buIndex % 2 ? 'us-east-1' : 'us-west-2' },
    })

    // Two servers per BU
    for (let i = 1; i <= SERVERS_PER_BU; i++) {
      const sid = `bu${buIndex}-server${i}`
      nodes.push({
        id: sid,
        kind: 'server',
        icon: '#instanceIcon',
        fillColor: '#B2DFDB',
        label: `Server ${i}`,
        subLabel: `BU ${buIndex}`,
        meta: { cpu: `${20 + (buIndex + i) % 60}%`, mem: `${30 + (buIndex * i) % 55}%` },
      })
      links.push({ source: bu, target: sid })
    }
  }

  return { nodes, links }
}

// ─── Component ───────────────────────────────────────────────────────────────
export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const graphRef = useRef<VisGraphRef<FlowNode, FlowLink>>(null)

  const [pinned, setPinned] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [layoutDir, setLayoutDir] = useState<'LR' | 'TB'>('LR')

  const svgDefs = `${personIcon}${roleIcon}${instanceIcon}${bucketIcon}`

  const data = useMemo(() => buildGraph(pinned), [pinned])

  // Re-fit on data change so newly-added / removed nodes are always framed
  useEffect(() => {
    const g = graphRef.current?.component
    if (!g) return
    const id = requestAnimationFrame(() => g.fitView(props.duration ?? 400))
    return () => cancelAnimationFrame(id)
  }, [data, layoutDir, props.duration])

  // ─── Drawer interactions ──────────────────────────────────────────────────
  const togglePin = useCallback((id: string) => {
    setPinned(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const clearPins = useCallback(() => {
    setPinned(new Set())
    setSelectedNodeId(null)
  }, [])

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return ALL_CUSTOMER_IDS
    return ALL_CUSTOMER_IDS.filter(id => {
      const label = `customer ${id.split('-')[1]}`
      return id.toLowerCase().includes(q) || label.includes(q)
    })
  }, [search])

  // ─── Node click → detail card + smart drill behaviour ─────────────────────
  const onNodeClick = useCallback((n: FlowNode) => {
    setSelectedNodeId(n.id)
    // Clicking the customers aggregator focuses the drawer for drill-in
    if (n.kind === 'aggregator-customers') {
      // Nothing to do here — the drawer is already open. Just a UX cue.
    }
  }, [])

  // Highlight the path from the backbone to the currently selected node
  const selectedPath = useMemo(() => {
    if (!selectedNodeId) return new Set<string>()
    const path = new Set<string>([selectedNodeId])
    const linkMap = new Map<string, string>()
    for (const l of data.links) linkMap.set(l.target, l.source)
    let cur: string | undefined = selectedNodeId
    while (cur && linkMap.has(cur)) {
      const parent = linkMap.get(cur) as string
      path.add(parent)
      cur = parent
    }
    return path
  }, [selectedNodeId, data.links])

  const selectedNode = useMemo(
    () => (selectedNodeId ? data.nodes.find(n => n.id === selectedNodeId) : null),
    [selectedNodeId, data.nodes]
  )

  // ─── Breadcrumb model ─────────────────────────────────────────────────────
  const crumbs = useMemo(() => {
    const parts: { label: string; onClick?: () => void; active?: boolean }[] = [
      { label: 'Overview', onClick: () => clearPins() },
    ]
    if (pinned.size > 0) {
      parts.push({ label: `Customers · ${pinned.size} pinned`, active: !selectedNodeId })
    }
    if (selectedNode && selectedNode.kind !== 'backbone') {
      parts.push({ label: selectedNode.label, active: true })
    }
    return parts
  }, [pinned.size, selectedNode, selectedNodeId, clearPins])

  // ─── Graph accessors ──────────────────────────────────────────────────────
  const nodeSideLabels = useCallback((n: FlowNode): GraphCircleLabel[] => {
    if (!n.badge) return []
    return [{
      text: n.badge > 999 ? '999+' : String(n.badge),
      color: '#4f46e5',
      textColor: '#ffffff',
      radius: 11,
      fontSize: '10px',
    }]
  }, [])

  const nodeStroke = useCallback((n: FlowNode) => (
    selectedPath.has(n.id) ? '#4f46e5' : 'none'
  ), [selectedPath])

  const linkStroke = useCallback((l: FlowLink) => {
    const sId = typeof l.source === 'string' ? l.source : (l.source as unknown as FlowNode).id
    const tId = typeof l.target === 'string' ? l.target : (l.target as unknown as FlowNode).id
    return selectedPath.has(sId) && selectedPath.has(tId) ? '#4f46e5' : undefined
  }, [selectedPath])

  const layoutNodeGroup = useCallback((n: FlowNode) => {
    if (n.id === 'auth') return 'layer-1'
    if (n.id === 'compliance') return 'layer-2'
    if (n.id === 'firewall') return 'layer-3'
    if (n.kind === 'aggregator-customers') return 'layer-4'
    if (n.kind === 'customer') return 'layer-5'
    if (n.id === 'blob1') return 'layer-5b'
    if (n.kind === 'aggregator-bu' || n.kind === 'bu') return 'layer-6'
    if (n.kind === 'aggregator-server' || n.kind === 'server') return 'layer-7'
    return 'other'
  }, [])

  return (
    <div className={s.root}>
      {/* ── Canvas (with docked toolbar) ──────────────────────────────────── */}
      <div className={s.canvas}>
        <div className={s.toolbar}>
          <div className={s.breadcrumbs}>
            {crumbs.map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className={s.crumbSep}>›</span>}
                <button
                  className={`${s.crumb} ${c.active ? s.crumbActive : ''}`}
                  onClick={c.onClick}
                  disabled={!c.onClick}
                >{c.label}</button>
              </React.Fragment>
            ))}
          </div>
          <div className={s.toolbarActions}>
            <button
              className={s.btn}
              onClick={() => setLayoutDir(layoutDir === 'LR' ? 'TB' : 'LR')}
            >
              {layoutDir === 'LR' ? 'Top → Bottom' : 'Left → Right'}
            </button>
            <button
              className={s.btn}
              onClick={() => graphRef.current?.component?.fitView(props.duration ?? 400)}
            >Fit</button>
            <button
              className={s.btn}
              onClick={clearPins}
              disabled={pinned.size === 0}
            >Reset</button>
          </div>
        </div>

        <div className={s.canvasBody}>
          <VisSingleContainer svgDefs={svgDefs} className={s.container}>
            <VisGraph<FlowNode, FlowLink>
              ref={graphRef as any}
              data={data}
              nodeIcon={n => n.icon}
              nodeIconSize={18}
              nodeSize={30}
              nodeStroke={nodeStroke}
              nodeStrokeWidth={3}
              nodeFill={n => n.fillColor}
              nodeLabel={n => n.label}
              nodeSubLabel={n => n.subLabel ?? ''}
              nodeSideLabels={nodeSideLabels}
              layoutType={layoutDir === 'LR' ? 'parallel' : 'parallel horizontal'}
              layoutNodeGroup={layoutNodeGroup}
              layoutGroupOrder={[
                'layer-1', 'layer-2', 'layer-3', 'layer-4',
                'layer-5', 'layer-5b',
                'layer-6', 'layer-7',
              ]}
              layoutParallelNodesPerColumn={15}
              layoutParallelNodeSpacing={90}
              layoutParallelGroupSpacing={140}
              zoomScaleExtent={[0.35, 3]}
              linkCurvature={0.5}
              linkStroke={linkStroke}
              duration={props.duration}
              events={useMemo(() => ({
                [Graph.selectors.node]: {
                  click: (n: FlowNode) => onNodeClick(n),
                },
                [Graph.selectors.background]: {
                  click: () => setSelectedNodeId(null),
                },
              }), [onNodeClick])}
            />
          </VisSingleContainer>

          {/* Detail card — appears on node click ─────────────────────────── */}
          {selectedNode && (
            <div className={s.detail}>
              <div className={s.detailHeader}>
                <span className={s.detailTitle}>{selectedNode.label}</span>
                <button
                  className={s.detailClose}
                  onClick={() => setSelectedNodeId(null)}
                  aria-label="Close"
                >×</button>
              </div>
              <div className={s.detailBody}>
                <div className={s.detailRow}>
                  <span className={s.detailKey}>Type</span>
                  <span className={s.detailVal}>{selectedNode.kind}</span>
                </div>
                {selectedNode.subLabel && (
                  <div className={s.detailRow}>
                    <span className={s.detailKey}>Summary</span>
                    <span className={s.detailVal}>{selectedNode.subLabel}</span>
                  </div>
                )}
                {selectedNode.meta && Object.entries(selectedNode.meta).map(([k, v]) => (
                  <div key={k} className={s.detailRow}>
                    <span className={s.detailKey}>{k}</span>
                    <span className={s.detailVal}>{v}</span>
                  </div>
                ))}
              </div>
              {selectedNode.kind === 'customer' && (
                <div className={s.detailActions}>
                  <button
                    className={s.btn}
                    onClick={() => togglePin(selectedNode.id)}
                  >Unpin from graph</button>
                </div>
              )}
            </div>
          )}

          <div className={s.hint}>
            Click the Customers aggregator to open the drill-in list. Pin ≤ 10 for readability.
          </div>
        </div>
      </div>

      {/* ── Right drawer — search + pinned list ──────────────────────────── */}
      <aside className={s.drawer}>
        <div className={s.drawerHeader}>
          <div className={s.drawerTitle}>Drill into customers</div>
          <div className={s.drawerSubtitle}>
            Pin the ones you want to trace. The rest stay in the group.
          </div>
        </div>

        <input
          className={s.search}
          type="search"
          placeholder="Search customer id or number…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className={s.count}>
          {filteredCustomers.length} of {TOTAL_CUSTOMERS} · {pinned.size} pinned
        </div>

        <ul className={s.list}>
          {filteredCustomers.slice(0, 200).map(id => {
            const isPinned = pinned.has(id)
            const num = Number(id.split('-')[1])
            const bu = getBUForCustomer(id)
            return (
              <li
                key={id}
                className={`${s.item} ${isPinned ? s.itemPinned : ''}`}
                onClick={() => togglePin(id)}
              >
                <input
                  type="checkbox"
                  className={s.itemCheckbox}
                  checked={isPinned}
                  onChange={() => togglePin(id)}
                  onClick={e => e.stopPropagation()}
                />
                <span className={s.itemLabel}>Customer {num}</span>
                <span className={s.itemMeta}>→ BU {bu.split('-').pop()}</span>
              </li>
            )
          })}
        </ul>

        <div className={s.drawerFooter}>
          <span>{filteredCustomers.length > 200 ? 'Showing first 200. Refine search.' : ''}</span>
          <button
            className={s.btn}
            onClick={clearPins}
            disabled={pinned.size === 0}
          >Clear pins</button>
        </div>
      </aside>
    </div>
  )
}
