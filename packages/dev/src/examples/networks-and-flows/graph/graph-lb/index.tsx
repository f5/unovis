import React, { useRef } from 'react'
import { VisSingleContainer, VisGraph } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

import personIcon from './person.svg?raw'
import roleIcon from './role.svg?raw'
import instanceIcon from './instance.svg?raw'
import bucketIcon from './bucket.svg?raw'

import lbJson from './lb-data.json'
import s from './index.module.css'

export const title = 'Graph: Load balancer flow (lb-data)'
export const subTitle = 'metadata/spec → service path with SVG icons'

type LbRaw = {
  name?: string;
  metadata?: { name?: string; labels?: Record<string, string>; annotations?: Record<string, unknown> };
  spec?: Record<string, unknown>;
  getSpec?: Record<string, unknown>;
}

type LbFlowNode = {
  id: string;
  icon: string;
  fillColor: string;
  label: string;
  sublabel: string;
}

type LbFlowLink = { source: number; target: number; label?: { text: string } }

function formatExpiry (raw: unknown): string {
  if (typeof raw === 'string') return raw
  if (raw && typeof raw === 'object' && Object.keys(raw as object).length === 0) return 'Unknown'
  return String(raw ?? 'Unknown')
}

function tlsHint (https: Record<string, any> | undefined): string | undefined {
  const cs = https?.tls_cert_params?.tls_config?.custom_security
  if (!cs) return undefined
  const minV = cs.min_version as string | undefined
  const maxV = cs.max_version as string | undefined
  const n = Array.isArray(cs.cipher_suites) ? cs.cipher_suites.length : 0
  if (!minV && !maxV && n === 0) return undefined
  const ver = minV && maxV ? `${minV}–${maxV}` : minV || maxV || 'TLS'
  return n > 0 ? `${ver} · ${n} ciphers` : ver
}

function httpsIdleSeconds (https: Record<string, any> | undefined): string | undefined {
  const ms = https?.connection_idle_timeout
  return typeof ms === 'number' && ms > 0 ? `${Math.round(ms / 1000)}s idle` : undefined
}

function subsetRuleCount (spec: Record<string, any>): number {
  const rules = spec?.origin_server_subset_rule_list?.origin_server_subset_rules
  return Array.isArray(rules) ? rules.length : 0
}

function moreOptionHints (mo: Record<string, any> | undefined): string[] {
  if (!mo || typeof mo !== 'object') return []
  const out: string[] = []
  const bp = mo.buffer_policy
  if (bp && !bp.disabled && typeof bp.max_request_bytes === 'number') {
    const mb = Math.round(bp.max_request_bytes / 1e6 * 10) / 10
    out.push(`Buffer ≤${mb}MB`)
  }
  if (typeof mo.idle_timeout === 'number' && mo.idle_timeout > 0) {
    out.push(`Opt idle ${Math.round(mo.idle_timeout / 1000)}s`)
  }
  const addN = Array.isArray(mo.request_headers_to_add) ? mo.request_headers_to_add.length : 0
  const remN = Array.isArray(mo.request_headers_to_remove) ? mo.request_headers_to_remove.length : 0
  if (addN + remN > 0) out.push(`Hdr ±${addN}/${remN}`)
  const ce = mo.custom_errors
  if (ce && typeof ce === 'object' && Object.keys(ce).length > 0) {
    out.push(`Custom errors (${Object.keys(ce).length})`)
  }
  return out
}

const DISABLE_FLAG_LABELS: [keyof Record<string, unknown>, string][] = [
  ['disable_ip_reputation', 'IP reputation off'],
  ['disable_rate_limit', 'Rate limit off'],
  ['disable_malicious_user_detection', 'Malicious-user ML off'],
  ['disable_api_discovery', 'API discovery off'],
  ['disable_trust_client_ip_headers', 'Trust client IP hdrs off'],
  ['disable_client_side_defense', 'Client-side defense off'],
  ['disable_api_definition', 'API definition off'],
  ['disable_threat_mesh', 'Threat mesh off'],
  ['disable_malware_protection', 'Malware protection off'],
]

function disabledFeatureHints (spec: Record<string, any>): string[] {
  return DISABLE_FLAG_LABELS.filter(([k]) => spec[k]).map(([, label]) => label)
}

function firstProtectedBotPath (spec: Record<string, any>): string | undefined {
  const eps = spec?.bot_defense?.policy?.protected_app_endpoints
  if (!Array.isArray(eps) || eps.length === 0) return undefined
  const p = eps[0]?.path?.path
  const m = eps[0]?.http_methods?.[0]
  return typeof p === 'string' ? `${typeof m === 'string' ? `${m.replace('METHOD_', '')} ` : ''}${p}`.trim() : undefined
}

function annotationKeys (meta: LbRaw['metadata']): string | undefined {
  const a = meta?.annotations
  if (!a || typeof a !== 'object') return undefined
  const keys = Object.keys(a)
  return keys.length > 0 ? keys.join(', ') : undefined
}

function buildLbFlowGraph (raw: LbRaw): { nodes: LbFlowNode[]; links: LbFlowLink[] } {
  const spec = (raw.getSpec ?? raw.spec) as Record<string, any> | undefined
  const displayName = raw.name ?? raw.metadata?.name ?? 'Load balancer'
  const regionLabel = raw.metadata?.labels?.['store-region']
  const ann = annotationKeys(raw.metadata)

  const nodes: LbFlowNode[] = []
  const links: LbFlowLink[] = []

  const userIdx = nodes.length
  nodes.push({
    id: 'external-user',
    icon: '#personIcon',
    fillColor: '#DFFAFD',
    label: 'External User',
    sublabel: 'User',
  })

  const publicLb =
    !!spec?.advertise_on_public_default_vip ||
    !!spec?.advertise_on_public
  const privateLb =
    !!spec?.advertise_on_custom ||
    (Array.isArray(spec?.advertise_custom?.advertise_where) && spec.advertise_custom.advertise_where.length > 0)

  const lbLabel = publicLb ? 'Public Load Balancer' : privateLb ? 'Private Load Balancer' : 'Load Balancer'
  const dnsIp = spec?.dns_info?.[0]?.ip_address as string | undefined
  const lbParts = [displayName, regionLabel, dnsIp ? `VIP ${dnsIp}` : undefined, ann ? `annotations: ${ann}` : undefined]
    .filter(Boolean)
    .join(' · ')
  const https = spec?.https as Record<string, any> | undefined
  const lbIdx = nodes.length
  nodes.push({
    id: `lb-${displayName}`,
    icon: '#instanceIcon',
    fillColor: '#D0E1FC',
    label: lbLabel,
    sublabel: https?.http_redirect ? `${lbParts} · HTTP→HTTPS` : lbParts,
  })
  links.push({ source: userIdx, target: lbIdx })

  let lastLayer: number[] = [lbIdx]

  const tlsCertName = spec?.https?.tls_cert_params?.certificates?.[0]?.name as string | undefined
  const tlsLine = tlsHint(https)
  const idleLine = httpsIdleSeconds(https)

  const domains: string[] = Array.isArray(spec?.domains) ? spec.domains : []
  if (domains.length > 0) {
    const certState = spec?.cert_state ?? 'Unknown'
    const expStr = formatExpiry(spec?.downstream_tls_certificate_expiration_timestamps?.[0])

    const certIndices: number[] = []
    for (const domain of domains) {
      const i = nodes.length
      certIndices.push(i)
      const certRef = tlsCertName ? ` · Ref: ${tlsCertName}` : ''
      const tlsExtra = [tlsLine, idleLine].filter(Boolean).join(' · ')
      const subExtra = tlsExtra ? ` · ${tlsExtra}` : ''
      nodes.push({
        id: `cert-${domain}`,
        icon: '#roleIcon',
        fillColor: '#E3DEFC',
        label: 'Certificate',
        sublabel: `${domain} · ${certState} · Exp: ${expStr}${certRef}${subExtra}`,
      })
      links.push({ source: lbIdx, target: i, label: { text: 'SNI' } })
    }
    lastLayer = certIndices
  }

  const wafN = spec?.waf_exclusion_rules?.length ?? 0
  const dgN = spec?.data_guard_rules?.length ?? 0
  const blockedN = spec?.blocked_clients?.length ?? 0
  const trustedN = spec?.trusted_clients?.length ?? 0
  const ddosN = spec?.ddos_mitigation_rules?.length ?? 0
  const l7 = spec?.l7_ddos_protection
  const hasL7 = l7 != null && typeof l7 === 'object' && Object.keys(l7).length > 0

  const securityParts: string[] = []
  if (spec?.user_id_client_ip) securityParts.push('Client IP ID')
  if (wafN > 0) securityParts.push(`WAF exclusions (${wafN})`)
  if (dgN > 0) securityParts.push(`Data guard (${dgN})`)
  if (blockedN > 0) securityParts.push(`Blocked clients (${blockedN})`)
  if (trustedN > 0) securityParts.push(`Trusted clients (${trustedN})`)
  if (ddosN > 0) securityParts.push(`DDoS rules (${ddosN})`)
  if (hasL7) securityParts.push('L7 DDoS')

  const subsetN = subsetRuleCount(spec ?? {})
  if (subsetN > 0) securityParts.push(`Subset rules (${subsetN})`)

  securityParts.push(...moreOptionHints(spec?.more_option))

  securityParts.push(...disabledFeatureHints(spec ?? {}))

  if (spec?.rate_limit != null) securityParts.push('Rate limit (on)')

  const hasCommonSecurity = securityParts.length > 0

  if (hasCommonSecurity) {
    const secIdx = nodes.length
    const maxParts = 12
    const sub =
      securityParts.length > maxParts
        ? `${securityParts.slice(0, maxParts).join(' · ')} · +${securityParts.length - maxParts} more`
        : securityParts.join(' · ')
    nodes.push({
      id: 'common-security',
      icon: '#roleIcon',
      fillColor: '#EDE7F6',
      label: 'Common security',
      sublabel: sub,
    })
    for (const i of lastLayer) {
      links.push({ source: i, target: secIdx })
    }
    lastLayer = [secIdx]
  }

  const apiRules = spec?.api_protection_rules
  if (Array.isArray(apiRules) && apiRules.length > 0) {
    const apiIdx = nodes.length
    nodes.push({
      id: 'api-protection',
      icon: '#instanceIcon',
      fillColor: '#E1BEE7',
      label: 'API protection',
      sublabel: `${apiRules.length} rule(s)`,
    })
    for (const i of lastLayer) {
      links.push({ source: i, target: apiIdx })
    }
    lastLayer = [apiIdx]
  }

  const botOn = spec?.bot_defense && !spec?.disable_bot_defense
  if (botOn) {
    const botIdx = nodes.length
    const epN = spec.bot_defense?.policy?.protected_app_endpoints?.length ?? 0
    const jsPath = spec.bot_defense?.policy?.js_download_path as string | undefined
    const firstPath = firstProtectedBotPath(spec)
    const pathHint = firstPath ? ` · ${firstPath}` : ''
    nodes.push({
      id: 'bot-defense',
      icon: '#personIcon',
      fillColor: '#FFECB3',
      label: 'BOT / fraud',
      sublabel: epN > 0
        ? `${epN} path(s)${jsPath ? ` · JS ${jsPath}` : ''}${pathHint}`
        : `Automated fraud protection${pathHint}`,
    })
    for (const i of lastLayer) {
      links.push({ source: i, target: botIdx })
    }
    lastLayer = [botIdx]
  }

  const waapName = spec?.app_firewall?.name as string | undefined
  if (waapName) {
    const wIdx = nodes.length
    nodes.push({
      id: 'waap',
      icon: '#instanceIcon',
      fillColor: '#B3E5FC',
      label: 'WAAP',
      sublabel: waapName,
    })
    for (const i of lastLayer) {
      links.push({ source: i, target: wIdx })
    }
    lastLayer = [wIdx]
  }

  const routesIdx = nodes.length
  const routeCount = Array.isArray(spec?.routes) ? spec.routes.length : 0
  nodes.push({
    id: 'routes',
    icon: '#roleIcon',
    fillColor: '#C5E3F6',
    label: 'Routes',
    sublabel: routeCount > 0 ? `${routeCount} custom` : 'Default only',
  })
  for (const i of lastLayer) {
    links.push({ source: i, target: routesIdx })
  }


  const pools = spec?.default_route_pools
  if (Array.isArray(pools) && pools.length > 0) {
    const drIdx = nodes.length
    nodes.push({
      id: 'default-route',
      icon: '#instanceIcon',
      fillColor: '#A8D4F0',
      label: 'Default Route',
      sublabel: 'Catch-all backend',
    })
    links.push({ source: routesIdx, target: drIdx, label: { text: 'default' } })

    for (const entry of pools) {
      const poolName = entry?.pool?.name ?? 'pool'
      // Pool node with details
      const poolIdx = nodes.length
      nodes.push({
        id: `pool-${poolName}`,
        icon: '#bucketIcon',
        fillColor: '#D4DBFB',
        label: 'Pool',
        sublabel: 'f5dev\nNodes: 1\nAlgorithm: LB_OVERRIDE\nPort: 443',
      })
      links.push({ source: drIdx, target: poolIdx, label: { text: 'pool' } })

      // Node 1 with DNS info
      const dns = spec?.dns_info?.[0]?.ip_address ? 'f5networks-dev65.adobecqms.net' : 'Unknown'
      const nodeIdx = nodes.length
      nodes.push({
        id: 'node-1',
        icon: '#instanceIcon',
        fillColor: '#B2DFDB',
        label: 'Node 1',
        sublabel: `DNS: ${dns}`,
      })
      links.push({ source: poolIdx, target: nodeIdx, label: { text: 'member' } })
    }
  }

  return { nodes, links }
}

const data = buildLbFlowGraph(lbJson as LbRaw)

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const containerRef = useRef<HTMLDivElement>(null)

  const svgDefs = `
    ${personIcon}
    ${roleIcon}
    ${instanceIcon}
    ${bucketIcon}
  `

  const handleDownloadSvg = (): void => {
    if (!containerRef.current) return

    const svgElement = containerRef.current.querySelector('svg') as SVGSVGElement
    if (!svgElement) {
      console.warn('SVG element not found')
      return
    }

    // Clone the SVG to preserve all styles and definitions
    const svgClone = svgElement.cloneNode(true) as SVGSVGElement

    // Serialize to string
    const svgString = new XMLSerializer().serializeToString(svgClone)

    // Create blob and download
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'load-balancer-flow.svg'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={s.graph}>
      <button onClick={handleDownloadSvg} style={{ marginBottom: '12px', padding: '8px 16px', cursor: 'pointer' }}>
        Download SVG
      </button>
      <div ref={containerRef}>
        <VisSingleContainer svgDefs={svgDefs} height={600}>
          <VisGraph<LbFlowNode, LbFlowLink>
            data={data}
            nodeIcon={(n) => n.icon}
            nodeIconSize={18}
            nodeStroke={'none'}
            nodeFill={n => n.fillColor}
            nodeLabel={n => n.label}
            nodeSubLabel={n => n.sublabel}
            layoutType='dagre'
            dagreLayoutSettings={{
              rankdir: 'LR',
              ranksep: 140,
              nodesep: 32,
            }}
            linkBandWidth={6}
            linkFlow={true}
            linkCurvature={1}
            linkArrow={'single'}
            linkLabel={(l) => l.label}
            linkFlowParticleSize={4}
            duration={props.duration}
          />
        </VisSingleContainer>
      </div>
    </div>
  )
}
