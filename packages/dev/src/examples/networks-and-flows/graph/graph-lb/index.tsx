import React, { useRef, useCallback, useEffect, useState } from 'react'
import { VisSingleContainer, VisGraph, VisGraphRef, VisGraphSelectors } from '@unovis/react'
import { GraphNode, GraphLinkCore } from '@unovis/ts'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

import personIcon from './person.svg?raw'
import roleIcon from './role.svg?raw'
import instanceIcon from './instance.svg?raw'
import bucketIcon from './bucket.svg?raw'
import routeIcon from './route.svg?raw'

import s from './index.module.css'

export const title = 'Graph: Load balancer flow'
export const subTitle = 'Controllable node expand/collapse with route→pool links'

// ─── Node / Link types ────────────────────────────────────────────────────────
type RouteDetails = {
  method: string;
  pathMatch: string;
  headerMatch: string;
}

type LbFlowNode = {
  id: string;
  icon: string;
  fillColor: string;
  label: string;
  /** true → participates in collapse tree (has children it can hide) */
  expandable: boolean;
  /** direct child ids for the collapse tree */
  childIds?: string[];
  /** when set, node is a route badge — small circle styled like a link label */
  routeNum?: number;
  /** route match details shown as always-visible label template below the badge */
  routeDetails?: RouteDetails;
}

type LbFlowLink = {
  source: string;
  target: string;
  /** circle label(s) on the link — text can be plain string or SVG symbol id like '#roleIcon' */
  label?: { text: string } | { text: string }[];
}

// ─── Static graph data ────────────────────────────────────────────────────────

// Route assignments per pool
const POOL1_ROUTE_IDS = ['route-2', 'route-3', 'route-4', 'route-5', 'route-6', 'route-8', 'route-12', 'route-13']
const POOL2_ROUTE_IDS = ['route-1', 'route-7', 'route-9', 'route-10', 'route-11', 'route-14', 'route-15', 'route-16', 'route-17']
const ALL_ROUTE_IDS = Array.from({ length: 17 }, (_, i) => `route-${i + 1}`)

// Custom SVG shape factory for route badge nodes.
// Content starts at (0,0) top-left — unovis centers it by bBox automatically
// (applies translate(-bBox.width/2, -bBox.height/2)), so pre-centering must NOT be done here.
// Layout: [icon 11px] [10px gap] [badge badgeW px], all 16px tall.
// When `details` is provided, three key-value rows are appended below the badge (transparent
// background, always visible). The bBox grows, so link offsets must be updated accordingly.
function routeNodeShape (routeNum: number, details?: RouteDetails): string {
  const label = `Route ${routeNum}`
  const badgeW = label.length > 2 ? 80 : 30
  const badgeLabelX = 21 + badgeW / 2
  const badge = (
    '<use href="#routeIcon" x="0" y="0" width="11" height="16"/>' +
    `<rect rx="4" ry="4" x="21" y="0" width="${badgeW}" height="16" fill="#E6E9F3"/>` +
    `<text x="${badgeLabelX}" y="8" text-anchor="middle" dominant-baseline="middle" ` +
    `font-family="Inter" font-weight="700" font-size="12" fill="#0F1E57">${label}</text>`
  )
  if (!details) return badge

  const rows = [
    { key: 'Method', value: details.method },
    { key: 'Path Match', value: details.pathMatch },
    { key: 'Header Match', value: details.headerMatch },
  ]

  // Three label rows — no background rect (transparent), font-size 9, dominant-baseline middle
  const labelRows = rows.map((row, i) => {
    const y = 26 + i * 14
    return (
      `<text x="0" y="${y}" font-family="Inter" font-size="9" dominant-baseline="middle">` +
      `<tspan font-weight="600" fill="#6B7280">${row.key}: </tspan>` +
      `<tspan fill="#0F1E57">${row.value}</tspan>` +
      '</text>'
    )
  }).join('')

  return badge + labelRows
}

// All collapsible ids — used for expand/collapse all buttons
const COLLAPSIBLE_IDS = ['routes', 'pool-1', 'pool-2']

const nodes: LbFlowNode[] = [
  // ── Fixed backbone (expandable: false — always visible, click does nothing) ──
  {
    id: 'https-lb',
    icon: '#instanceIcon',
    fillColor: '#8777D9',
    label: 'HTTPS Load Balancers',
    expandable: false,
  },
  {
    id: 'certificates',
    icon: '#roleIcon',
    fillColor: '#3FCDC6',
    label: 'Certificates',
    expandable: false,
  },
  {
    id: 'csc',
    icon: '#roleIcon',
    fillColor: '#59BCFA',
    label: 'Common Security Controls',
    expandable: false,
  },
  {
    id: 'waf',
    icon: '#instanceIcon',
    fillColor: '#E0EAFF',
    label: 'WAF',
    expandable: false,
  },

  // ── Routes aggregator (collapsible) ─────────────────────────────────────────
  // childIds = route badges + pools (recursive hide covers pool members too)
  {
    id: 'routes',
    icon: '#roleIcon',
    fillColor: '#8777D9',
    label: 'Routes',
    expandable: true,
    childIds: [...ALL_ROUTE_IDS, 'pool-1', 'pool-2'],
  },

  // ── Route badge nodes — custom SVG shape (icon + label badge, no circle background) ──
  ...ALL_ROUTE_IDS.map((id, i) => ({
    id,
    icon: '', // icon is embedded in the custom nodeShape SVG
    fillColor: 'none', // transparent — shape styling is in nodeShape SVG
    label: '', // no external label
    sublabel: '',
    expandable: false,
    routeNum: i + 1,
    routeDetails: {
      method: 'GET',
      pathMatch: '/test/stest/stete',
      headerMatch: 'SHAPE-HEADER',
    },
  })),

  // ── Pools (collapsible — children: Node 1 & Node 2) ─────────────────────────
  {
    id: 'pool-1',
    icon: '#bucketIcon',
    fillColor: '#D4DBFB',
    label: 'Pool 1',
    expandable: true,
    childIds: ['pool1-node1', 'pool1-node2'],
  },
  {
    id: 'pool-2',
    icon: '#bucketIcon',
    fillColor: '#D4DBFB',
    label: 'Pool 2',
    expandable: true,
    childIds: ['pool2-node1', 'pool2-node2'],
  },

  // ── Pool member nodes (leaf) ─────────────────────────────────────────────────
  { id: 'pool1-node1', icon: '#instanceIcon', fillColor: '#B2DFDB', label: 'Node 1', expandable: false },
  { id: 'pool1-node2', icon: '#instanceIcon', fillColor: '#B2DFDB', label: 'Node 2', expandable: false },
  { id: 'pool2-node1', icon: '#instanceIcon', fillColor: '#B2DFDB', label: 'Node 1', expandable: false },
  { id: 'pool2-node2', icon: '#instanceIcon', fillColor: '#B2DFDB', label: 'Node 2', expandable: false },
]

const links: LbFlowLink[] = [
  // Fixed backbone chain
  { source: 'https-lb', target: 'certificates' },
  { source: 'certificates', target: 'csc' },
  { source: 'csc', target: 'waf' },
  { source: 'waf', target: 'routes' },

  // Routes aggregator → each route badge node
  ...ALL_ROUTE_IDS.map(id => ({ source: 'routes', target: id })),

  // Route badge nodes → Pool 1 (no link label — the badge node IS the route label)
  ...POOL1_ROUTE_IDS.map(id => ({ source: id, target: 'pool-1' })),

  // Route badge nodes → Pool 2
  ...POOL2_ROUTE_IDS.map(id => ({ source: id, target: 'pool-2' })),

  // Pool → member nodes
  { source: 'pool-1', target: 'pool1-node1' },
  { source: 'pool-1', target: 'pool1-node2' },
  { source: 'pool-2', target: 'pool2-node1' },
  { source: 'pool-2', target: 'pool2-node2' },
]

const graphData = { nodes, links }

// ─── Node popup details (shown on double-click) ───────────────────────────────
const POPUP_DETAILS: Record<string, { label: string; rows: { key: string; value: string }[] }> = {
  'https-lb': {
    label: 'HTTPS Load Balancers',
    rows: [
      { key: 'Type', value: 'Global external Application Load Balancer' },
      { key: 'Protocol', value: 'HTTPS / HTTP2' },
      { key: 'Forwarding rules', value: '2 (port 443)' },
      { key: 'Backend services', value: '3' },
      { key: 'Status', value: 'Active' },
    ],
  },
  certificates: {
    label: 'Certificates',
    rows: [
      { key: 'Managed by', value: 'Google-managed SSL' },
      { key: 'Domains', value: 'example.com, *.example.com' },
      { key: 'Expiry', value: '2026-11-30' },
      { key: 'Provisioning', value: 'Active' },
    ],
  },
  csc: {
    label: 'Common Security Controls',
    rows: [
      { key: 'IAM policy', value: 'roles/compute.loadBalancerAdmin' },
      { key: 'Org policy', value: 'compute.restrictLoadBalancerCreationForTypes' },
      { key: 'VPC SC perimeter', value: 'prod-perimeter' },
      { key: 'Audit logging', value: 'DATA_READ, DATA_WRITE' },
    ],
  },
}

// IDs that show a popup on double-click
const POPUP_NODE_IDS = new Set(Object.keys(POPUP_DETAILS))

// ─── Component ────────────────────────────────────────────────────────────────
export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const graphRef = useRef<VisGraphRef<LbFlowNode, LbFlowLink>>(null)
  const [expanded, setExpanded] = useState(false)
  const [popup, setPopup] = useState<{ nodeId: string; x: number; y: number } | null>(null)

  useEffect(() => {
    graphRef.current?.component?.setCollapsedNodes(COLLAPSIBLE_IDS)
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

  const handleNodeDblClick = useCallback((d: GraphNode<LbFlowNode, LbFlowLink>, event: MouseEvent) => {
    if (!POPUP_NODE_IDS.has(d.id as string)) return
    setPopup(prev =>
      prev?.nodeId === d.id ? null : { nodeId: d.id as string, x: event.clientX, y: event.clientY }
    )
  }, [])

  const graphEvents = {
    [VisGraphSelectors.node]: {
      dblclick: handleNodeDblClick,
    },
  }

  // Wrap routeIcon SVG as a <symbol id="routeIcon"> so it can be referenced via <use>
  const routeIconSymbol = routeIcon
    .replace(/<svg([^>]*)>/, '<symbol id="routeIcon"$1>')
    .replace('</svg>', '</symbol>')
  const svgDefs = `${personIcon}${roleIcon}${instanceIcon}${bucketIcon}${routeIconSymbol}`

  const popupDetail = popup ? POPUP_DETAILS[popup.nodeId] : null

  return (
    <div className={s.graph}>
      <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
        <button
          onClick={handleToggle}
          style={{ padding: '8px 16px', cursor: 'pointer', borderRadius: 4, border: '1px solid #aaa' }}
        >
          {expanded ? 'Collapse All' : 'Expand All'}
        </button>
      </div>
      <VisSingleContainer svgDefs={svgDefs} className={s.graphContainer}>
        <VisGraph<LbFlowNode, LbFlowLink>
          ref={graphRef as any}
          data={graphData}
          nodeShape={(n: LbFlowNode) => n.routeNum ? routeNodeShape(n.routeNum, n.routeDetails) : 'circle'}
          nodeIcon={n => n.icon}
          nodeIconSize={n => n.routeNum ? 16 : 18}
          nodeSize={n => n.routeNum ? 20 : 30}
          nodeStroke='none'
          nodeStrokeWidth={n => n.routeNum ? 0 : 3}
          nodeFill={n => n.fillColor}
          nodeLabel={n => n.routeNum ? '' : n.label}
          layoutType="dagre"
          dagreLayoutSettings={{ rankdir: 'LR', ranksep: 120, edgesep: 200, nodesep: 120 }}
          nodeExpandable={n => n.expandable}
          nodeChildren={n => n.childIds ?? []}
          linkCurvature={1}
          linkSourcePointOffset={(l: GraphLinkCore<LbFlowNode, LbFlowLink>) =>
            // bBox with label rows: width≈154, height≈59 → badge icon center at (-71, -21)
            l.source.routeNum ? [-71, -21] : [0, 0]
          }
          linkTargetPointOffset={(l: GraphLinkCore<LbFlowNode, LbFlowLink>) =>
            // Left edge of bBox (where badge icon starts) at (-77, -21)
            l.target.routeNum ? [-77, -21] : [0, 0]
          }
          duration={props.duration}
          events={graphEvents}
        />
      </VisSingleContainer>
      {popupDetail && popup && (
        <div
          className={s.nodePopup}
          style={{ top: popup.y + 12, left: popup.x + 12 }}
        >
          <div className={s.nodePopupHeader}>
            <span className={s.nodePopupTitle}>{popupDetail.label}</span>
            <button className={s.nodePopupClose} onClick={() => setPopup(null)}>✕</button>
          </div>
          <div className={s.nodePopupBody}>
            <table className={s.nodePopupTable}>
              <tbody>
                {popupDetail.rows.map(row => (
                  <tr key={row.key}>
                    <td className={s.nodePopupKey}>{row.key}</td>
                    <td className={s.nodePopupVal}>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
