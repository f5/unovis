import { sum } from 'd3-array'
import { groupBy } from '@src/utils/array'
import { SankeyLink, SankeyNode } from '@unovis/ts'

export type ApiEndpointRecord = {
  collapsedUrl: string;
  method: string;
  value?: number;
  dynExamples?: {
    componentIdentifier: string;
    componentExamples: string[];
  }[];
}

export type ApiEndpointNode = {
  id: string;
  path: string;
  url: string;
  label: string;
  depth: number;
  collapsed: boolean;
  isLeafNode: boolean;
  method: string;
  dynExamples: string[];
  value: number;
  leafs: number;
  fixedValue: number; // Sum up link values
}

export type ApiEndpointLink = {
  id: string;
  source: string;
  target: string;
  value: number;
}

export function getSankeyData (apiData: ApiEndpointRecord[], collapsedItems: { [key: string]: boolean } = {}): { nodes: ApiEndpointNode[]; links: ApiEndpointLink[] } {
  const nodes: ApiEndpointNode[] = []
  const links: ApiEndpointLink[] = []

  const getNodeId = (path: string, depth: number, method: string): string => `${depth}:${path}:${method}`
  for (const rec of apiData) {
    const value = rec.value ?? 1

    let url = rec.collapsedUrl
    const isPartOfOtherUrl = apiData.find(
      r => r.collapsedUrl !== url && r.collapsedUrl?.includes(url)
    )

    // Remove trailing slash if any
    if (url.slice(-1) === '/') {
      url = url.slice(0, -1)
    }

    // Add a slash for creating an extra node if current URL is also
    //  a part of other URLs
    if (isPartOfOtherUrl) {
      url += '/'
    }

    // Split string to get nodes
    const urlSplit = url.split('/')

    // Add new nodes { id, path, url, label, depth }
    let path = ''
    for (let i = 0; i < urlSplit.length; i += 1) {
      const pathSegment = `/${urlSplit[i]}`
      path += pathSegment
      const label = pathSegment.replace('$DYN$', '<dynamic component>')

      const isLeafNode = i === urlSplit.length - 1
      const method = isLeafNode ? rec.method : ''
      const depth = i
      const id = getNodeId(path, depth, method)
      const collapsed = collapsedItems[id]

      const dyn = rec.dynExamples?.find(ex => ex.componentIdentifier === path.slice(1))
      const dynExamples = dyn?.componentExamples ?? []

      nodes.push({
        id,
        path,
        url,
        label,
        depth,
        collapsed,
        isLeafNode,
        method,
        dynExamples,
        value,
      } as ApiEndpointNode)
      if (collapsed) break
    }

    // Add new links { id, source, target, value }
    path = `/${urlSplit[0]}`
    for (let i = 1; i < urlSplit.length; i += 1) {
      const sourcePath = path
      const targetPath = `${path}/${urlSplit[i]}`
      const isTargetALeaf = i === urlSplit.length - 1
      const source = getNodeId(sourcePath, i - 1, '')
      const target = getNodeId(targetPath, i, isTargetALeaf ? rec.method : '')
      const id = `${source}~${target}`
      links.push({ id, source, target, value })
      path = targetPath
    }
  }

  // Groups nodes and links with the same id (depth : path)
  const groupedNodes = Object.values(groupBy(nodes, 'id'))
  const groupedLinks = Object.values(groupBy(links, 'id'))

  return {
    nodes: groupedNodes.map(nodeArr => ({
      ...nodeArr[0],
      leafs: nodeArr.length,
      fixedValue: sum(nodeArr.map(n => n.value)), // Sum up link values
    })),
    links: groupedLinks.map(linkArr => ({
      ...linkArr[0],
      value: sum(linkArr.map(l => l.value)), // Sum up link values
    })),
  }
}

export const compareStrings = (a = '', b = ''): number => {
  const strA = a.toUpperCase()
  const strB = b.toUpperCase()

  if (strA < strB) return -1
  if (strA > strB) return 1
  return 0
}

export const nodeSort = (a: SankeyNode<ApiEndpointNode, ApiEndpointLink>, b: SankeyNode<ApiEndpointNode, ApiEndpointLink>): number => {
  const aParent = a.targetLinks[0]?.source
  const bParent = b.targetLinks[0]?.source
  const aGrandparent = a.targetLinks[0]?.source?.targetLinks[0]?.source
  const bGrandparent = b.targetLinks[0]?.source?.targetLinks[0]?.source

  if ((aParent === bParent)) { // Same parent nodes are sorted by: value + alphabetically
    return (b.value - a.value) || compareStrings(a?.path, b?.path)
  } else { // Different parent nodes are sorted by: 1st grandparent value + 1st parent value + alphabetically
    return (bGrandparent?.value - aGrandparent?.value) || (bParent?.value - aParent?.value) || -compareStrings(aParent?.path, bParent?.path)
  }
}

export const linkSort = (a: SankeyLink<ApiEndpointNode, ApiEndpointLink>, b: SankeyLink<ApiEndpointNode, ApiEndpointLink>): number => {
  return b.value - a.value || compareStrings(a.target?.path, b.target?.path) // Links sorted by: value + alphabetically
}
