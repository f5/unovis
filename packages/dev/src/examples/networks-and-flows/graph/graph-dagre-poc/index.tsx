import React, { useCallback, useMemo, useRef, useState } from 'react'
import { GraphFitViewAlignment, GraphLink, GraphNode } from '@unovis/ts'
import type { VisGraphRef } from '@unovis/react'

import { CustomGraph } from './component'
import { CustomGraphNodeType } from './enums'
import type { CustomGraphLink, CustomGraphNode } from './types'

import * as s from './styles'

export const title = 'Graph: Dagre'
export const subTitle = 'User provided rendering functions'

export const component = (): React.ReactNode => {
  const [showLinkFlow, setShowLinkFlow] = useState(false)
  const [fitViewAlignment, setFitViewAlignment] = useState<GraphFitViewAlignment>(GraphFitViewAlignment.Center)
  const graphRef = useRef<VisGraphRef<CustomGraphNode, CustomGraphLink> | null>(null)

  const nodes: CustomGraphNode[] = useMemo(() => ([
    // Level 0: Virtual Server (root) - Identity
    { id: 'vs', type: CustomGraphNodeType.Identity, subLabel: 'Virtual Server', label: 'Virtual server', starred: true },

    // Level 1: Direct children of VS - Network
    { id: 'va', type: CustomGraphNodeType.Network, subLabel: 'Virtual Addresses', label: 'Virtual Addresses' },
    { id: 'p1', type: CustomGraphNodeType.Network, subLabel: 'Server TCP Profile', label: 'web-tcp-srv' },
    { id: 'p2', type: CustomGraphNodeType.Network, subLabel: 'Client TCP Profile', label: 'web-tcp-cli' },
    { id: 'p3', type: CustomGraphNodeType.Network, subLabel: 'Server HTTP Profile', label: 'webapp-http-srv' },
    { id: 'p4', type: CustomGraphNodeType.Network, subLabel: 'Client HTTP Profile', label: 'webapp-http-cli' },
    { id: 'p5', type: CustomGraphNodeType.Network, subLabel: 'Server SSL Profile', label: 'webapp-ssl-srv' },
    { id: 'p6', type: CustomGraphNodeType.Network, subLabel: 'Client SSL Profile', label: 'webapp-ssl-cli' },
    { id: 'tp', type: CustomGraphNodeType.Network, subLabel: 'Traffic Policies', label: 'Traffic Policies' },
    { id: 'ir', type: CustomGraphNodeType.Network, subLabel: 'iRules', label: 'iRules' },
    { id: 'defaultPool', type: CustomGraphNodeType.Network, subLabel: 'Default Pool', label: 'Default Pool' },


    // Level 2: Children of Level 1 nodes - Resource
    { id: 'va1', type: CustomGraphNodeType.Resource, subLabel: 'Virtual Address', label: 'webapp-public-vip' },
    { id: 'va2', type: CustomGraphNodeType.Resource, subLabel: 'Virtual Address', label: 'webapp-private-vip' },
    { id: 'tpr', type: CustomGraphNodeType.Resource, subLabel: 'Traffic Policies', label: 'Traffic Policies' },

    { id: 'ir1', type: CustomGraphNodeType.Resource, subLabel: 'iRule', label: 'redirect-to-login' },
    { id: 'ir2', type: CustomGraphNodeType.Resource, subLabel: 'iRule', label: 'add-app-header' },
    { id: 'dp1', type: CustomGraphNodeType.Resource, subLabel: 'Pool', label: 'web-homepage' },
    { id: 'dpHealth', type: CustomGraphNodeType.Resource, subLabel: 'Health monitor', label: 'Health monitor' },

    // Level 3: Children of Level 2 nodes - Compute
    { id: 'va1Adv', type: CustomGraphNodeType.Compute, subLabel: 'Advertised On', label: 'All REs' },
    { id: 'va2Adv', type: CustomGraphNodeType.Compute, subLabel: 'Advertised On', label: 'site-aws-prod' },
    { id: 'tp1', type: CustomGraphNodeType.Compute, subLabel: 'Traffic Policies', label: 'webapp-main-tpol' },


    // level 4: Secret
    { id: 'pool1', type: CustomGraphNodeType.Secret, subLabel: 'Pool', label: 'webapp-html' },
    { id: 'pool2', type: CustomGraphNodeType.Secret, subLabel: 'Pool', label: 'static-pages' },


    // level 5: Finding
    { id: 'pool1Members', type: CustomGraphNodeType.Finding, subLabel: 'Pool Members', label: 'Pool Members' },
    { id: 'pool1Health', type: CustomGraphNodeType.Finding, subLabel: 'Health monitors', label: 'Health monitors' },
    { id: 'pool2Members', type: CustomGraphNodeType.Finding, subLabel: 'Pool Members', label: 'Pool Members' },
    { id: 'pool2Health', type: CustomGraphNodeType.Finding, subLabel: 'Health monitor', label: 'Health monitor' },

    // Level 6: ThreatActor
    { id: 'ws1', type: CustomGraphNodeType.ThreatActor, subLabel: 'Web Server', label: 'web-server1' },
    { id: 'ws2', type: CustomGraphNodeType.ThreatActor, subLabel: 'Web Server', label: 'web-server2' },
    { id: 'hm1', type: CustomGraphNodeType.ThreatActor, subLabel: 'Health Monitor', label: 'app-healthcheck' },
    { id: 'hm2', type: CustomGraphNodeType.ThreatActor, subLabel: 'Health Monitor', label: 'server-healthcheck' },
    { id: 'img1', type: CustomGraphNodeType.ThreatActor, subLabel: 'Image Server', label: 'image-srv' },
    { id: 'hm3', type: CustomGraphNodeType.ThreatActor, subLabel: 'Health Monitor', label: 'static-pg-hc' },
  ]), [])

  const links: CustomGraphLink[] = useMemo(() => ([
    // Virtual Server to Level 1 nodes
    { source: 'vs', target: 'va', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 25 },
    { source: 'vs', target: 'p1', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 25 },
    { source: 'vs', target: 'p2', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 25 },
    { source: 'vs', target: 'p3', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 25 },
    { source: 'vs', target: 'p4', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 25 },
    { source: 'vs', target: 'p5', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 25 },
    { source: 'vs', target: 'p6', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 25 },
    { source: 'vs', target: 'tp', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 25 },

    { source: 'vs', target: 'ir', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 25 },
    { source: 'vs', target: 'defaultPool', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 25 },

    // Virtual Addresses to individual addresses
    { source: 'va', target: 'va1', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 20 },
    { source: 'va', target: 'va2', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 20 },

    // Virtual Addresses to their details
    { source: 'va1', target: 'va1Adv', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 15 },
    { source: 'va2', target: 'va2Adv', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 15 },

    // Traffic Policies to individual policies
    { source: 'tp', target: 'tpr', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 20 },
    { source: 'tpr', target: 'tp1', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 20 },
    { source: 'tp1', target: 'pool1', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 25 },
    { source: 'tp1', target: 'pool2', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 25 },

    // Pools to their groupings
    { source: 'pool1', target: 'pool1Members', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 20 },
    { source: 'pool1', target: 'pool1Health', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 20 },
    { source: 'pool2', target: 'pool2Members', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 20 },
    { source: 'pool2', target: 'pool2Health', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 20 },

    // Pool Members groupings to actual servers
    { source: 'pool1Members', target: 'ws1', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 15 },
    { source: 'pool1Members', target: 'ws2', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 15 },
    { source: 'pool2Members', target: 'img1', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 15 },

    // Health monitor groupings to actual monitors
    { source: 'pool1Health', target: 'hm1', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 15 },
    { source: 'pool1Health', target: 'hm2', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 15 },
    { source: 'pool2Health', target: 'hm3', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 15 },

    // iRules to individual rules
    { source: 'ir', target: 'ir1', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 20 },
    { source: 'ir', target: 'ir2', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 20 },

    // Default Pool to its components
    { source: 'defaultPool', target: 'dp1', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 20 },
    { source: 'defaultPool', target: 'dpHealth', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 20 },

    // Default Pool members (reusing existing servers)
    { source: 'dp1', target: 'ws1', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 15 },
    { source: 'dp1', target: 'ws2', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 15 },

    // Default Pool health monitor (reusing existing monitor)
    { source: 'dpHealth', target: 'hm1', showFlow: true, linkFlowParticleSize: 1, linkFlowParticleSpeed: 15 },
  ]), [])

  // Modifying layout after the calculation
  const onLayoutCalculated = useCallback((nodes: GraphNode<CustomGraphNode, CustomGraphLink>[], links: GraphLink<CustomGraphNode, CustomGraphLink>[]) => {
    nodes[0].x = 100
  }, [])


  const fitView = useCallback((nodeIds?: string[]) => {
    graphRef.current?.component?.fitView(undefined, nodeIds)
  }, [])

  return (
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
      fitViewPadding={useMemo(() => ({ top: 50, right: 50, bottom: 100, left: 50 }), [])}
    />
  )
}

