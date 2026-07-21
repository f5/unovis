import React from 'react'
import { VisSingleContainer, VisSankey } from '@unovis/react'
import { Sizing } from '@unovis/ts'

export const title = 'Crowded Sankey'
export const subTitle = 'Node tree with a crowded last level'

const segments = ['auth', 'billing', 'search', 'orders', 'catalog', 'users', 'admin', 'reports', 'export', 'settings']
const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']

const nodes: { id: string; label: string }[] = []
const links: { source: string; target: string; value: number }[] = []

// Deterministic tree: 2-4 children per node, 4 levels
const childCount = (depth: number, index: number): number =>
  depth === 0 ? 4 : depth === 1 ? 2 + index % 3 : depth === 2 ? 2 + index % 2 : 0

let leafCount = 0
const addNode = (id: string, label: string, depth: number, index: number): number => {
  nodes.push({ id, label })
  const count = childCount(depth, index)
  if (count === 0) return 1 + (leafCount++ % 5) * 2

  let value = 0
  for (let i = 0; i < count; i++) {
    const childId = `${id}/${i}`
    const childLabel = depth === 2 ? methods[(index + i) % methods.length] : `/${segments[(index * 3 + i) % segments.length]}`
    const childValue = addNode(childId, childLabel, depth + 1, i)
    links.push({ source: id, target: childId, value: childValue })
    value += childValue
  }
  return value
}
addNode('api', 'API', 0, 0)
const data = { nodes, links }

export const component = (): React.ReactNode => (
  <VisSingleContainer data={data} sizing={Sizing.Fit} style={{ height: '100%' }}>
    <VisSankey
      nodePadding={18}
      nodeAdaptivePadding={true}
      label={(d: typeof data.nodes[0]) => d.label}
    />
  </VisSingleContainer>
)
