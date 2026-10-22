import { describe, expect, it } from 'vitest'

import { Treemap } from './index'
import { TreemapNode } from './types'

describe('Treemap tile identity and paint order', () => {
  type Datum = { borough: string; species: string; value: number }

  function createTreemap (): Treemap<Datum> {
    return new Treemap<Datum>({
      layers: [d => d.borough, d => d.species],
      value: d => d.value,
      tileColor: '#4884ff',
      tileLabel: () => '',
      tileSort: (a, b) => b.value - a.value,
    })
  }

  function getTiles (treemap: Treemap<Datum>): SVGGElement[] {
    return treemap.tiles.selectAll<SVGGElement, TreemapNode<Datum>>(`g.${Treemap.selectors.tileGroup}`).nodes()
  }

  it('retains distinct tiles for the same species in different boroughs', () => {
    const treemap = createTreemap()
    treemap.setData([
      { borough: 'Bronx', species: 'oak', value: 10 },
      { borough: 'Brooklyn', species: 'oak', value: 20 },
    ])
    treemap.render(0)
    const before = getTiles(treemap)
    treemap.render(0)

    const after = getTiles(treemap)
    expect(after).toHaveLength(4)
    after.forEach((tile, i) => expect(tile).toBe(before[i]))
    treemap.destroy()
  })

  it('keeps parents behind their children after filtering and sorting', () => {
    const treemap = createTreemap()
    const bronx = [
      { borough: 'Bronx', species: 'honeylocust', value: 9700 },
      { borough: 'Bronx', species: 'London planetree', value: 7500 },
      { borough: 'Bronx', species: 'pin oak', value: 6400 },
    ]
    const brooklyn = [
      { borough: 'Brooklyn', species: 'honeylocust', value: 16900 },
      { borough: 'Brooklyn', species: 'London planetree', value: 34900 },
      { borough: 'Brooklyn', species: 'pin oak', value: 12300 },
    ]

    for (const data of [[...bronx, ...brooklyn], bronx, brooklyn, bronx, [...bronx, ...brooklyn.map(d => ({ ...d, value: 1 }))]]) {
      treemap.setData(data)
      treemap.render(0)

      const nodes = treemap.tiles.selectAll<SVGGElement, TreemapNode<Datum>>(`g.${Treemap.selectors.tileGroup}`).data()
      const expected = nodes[0].parent.descendants().filter(node => node.depth > 0)
      expect(nodes).toEqual(expected)
      nodes.forEach((node, i) => {
        if (node.parent.depth > 0) {
          expect(nodes.indexOf(node.parent)).toBeGreaterThanOrEqual(0)
          expect(nodes.indexOf(node.parent)).toBeLessThan(i)
        }
      })
    }
    treemap.destroy()
  })
})
