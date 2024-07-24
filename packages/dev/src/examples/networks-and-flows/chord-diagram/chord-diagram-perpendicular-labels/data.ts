import { randomNumberGenerator } from '@src/utils/data'
export type NodeDatum = { group: string; color: string; id: string }
export type LinkDatum = { source: string; target: string }

const groups = [
  { group: 'A', color: '#d26', count: 2, links: [0, 4, 1, 6] },
  { group: 'B', color: '#2d6', count: 7, links: [1, 0, 1, 2] },
  { group: 'C', color: '#26d', count: 4, links: [1, 2, 0, 4] },
  { group: 'D', color: '#62d', count: 20, links: [3, 6, 10, 0] },
]

export function getData (): { nodes: NodeDatum[]; links: LinkDatum[] } {
  const data = {
    nodes: new Array<NodeDatum>(),
    links: new Array<LinkDatum>(),
  }
  groups.forEach(({ count, links, ...n }) => {
    data.nodes.push(...Array(count).fill(0).map((_, i) => ({ ...n, id: `${n.group}${i}` })))
    links.forEach((x, index) => {
      data.links.push(...Array(x).fill(0).map(() => ({
        source: `${n.group}${Math.floor(randomNumberGenerator() * count)}`,
        target: `${groups[index].group}${Math.floor(randomNumberGenerator() * groups[index].count)}`,
      })))
    })
  })

  return data
}

export const data = getData()
