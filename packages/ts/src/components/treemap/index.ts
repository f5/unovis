import { Selection } from 'd3-selection'
import { hierarchy, treemap, HierarchyNode } from 'd3-hierarchy'
import { group } from 'd3-array'
import { scaleLinear } from 'd3-scale'
import { ComponentCore } from 'core/component'
import { SeriesDataModel } from 'data-models/series'
import { getColor } from 'utils/color'
import { getString, getNumber, isNumber } from 'utils/data'
import { smartTransition } from 'utils/d3'
import { TreemapConfigInterface, TreemapDefaultConfig } from './config'
import { TreemapNode } from './types'

import * as s from './style'

export class Treemap<Datum> extends ComponentCore<Datum[], TreemapConfigInterface<Datum>> {
  static selectors = s
  protected _defaultConfig = TreemapDefaultConfig as TreemapConfigInterface<Datum>
  public config: TreemapConfigInterface<Datum> = this._defaultConfig

  datamodel: SeriesDataModel<Datum> = new SeriesDataModel()
  tiles: Selection<SVGGElement, unknown, SVGGElement, unknown>

  constructor (config?: TreemapConfigInterface<Datum>) {
    super()
    if (config) this.setConfig(config)
    this.tiles = this.g.append('g')
  }

  _render (customDuration?: number): void {
    const { config, datamodel: { data } } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration

    if (!config.layers?.length) {
      console.warn('Unovis | Treemap: No layers defined')
      return
    }

    const layerAccessors = config.layers.map(layerAccessor => (i: number) => getString(data[i], layerAccessor, i))
    const nestedData = group(data.keys(), ...layerAccessors as [(d: number) => string])

    const rootNode = config.value !== undefined
      ? hierarchy(nestedData).sum(index => typeof index === 'number' && getNumber(data[index], config.value, index))
      : hierarchy(nestedData).count()

    const treemapLayout = treemap()
      .size([this._width, this._height])
      .round(true)
      .padding(this.config.padding)

    const treemapData = treemapLayout(rootNode) as TreemapNode<Datum>

    treemapData
      .eachBefore((node) => {
        if (!node.children) return

        const opacity = scaleLinear()
          .domain([-1, node.children.length])
          .range([1, 0])

        node.children.forEach((child, i) => {
          const treemapChild = child as TreemapNode<Datum>
          const color = getColor(treemapChild, config.tileColor, i, treemapChild.depth !== 1)
          treemapChild._state = {
            fill: color ?? (node as TreemapNode<Datum>)._state?.fill,
            fillOpacity: color === null ? opacity(i) : null,
          }
        })
      })

    const nodes = treemapData.descendants()
      .filter(d => d.depth > 0)

    // Render tiles
    const tiles = this.tiles.selectAll<SVGGElement, TreemapNode<Datum>>('g')
      .data(nodes, d => d._id)

    const tilesEnter = tiles.enter().append('g')

    // Background rectangles
    tilesEnter.append('rect').classed('background', true)
    tiles.merge(tilesEnter).select('rect.background')
      .style('fill', '#ffffff')
      .call(selection => smartTransition(selection, duration)
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
      )

    // Foreground rectangles
    tilesEnter.append('rect').classed('foreground', true)
    tiles.merge(tilesEnter).select('rect.foreground')
      .style('fill', d => d._state?.fill ?? getColor(d, config.tileColor))
      .style('fill-opacity', d => d._state?.fillOpacity ?? 1)
      .call(selection => smartTransition(selection, duration)
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
      )

    // Labels
    if (config.tileLabel) {
      tilesEnter.append('text')
      tiles.merge(tilesEnter).select('text')
        .style('fill', d => getColor(d, config.tileLabelColor))
        .text(d => getString(d, config.tileLabel))
        .call(selection => smartTransition(selection, duration)
          .attr('x', d => (d.x0 + d.x1) / 2)
          .attr('y', d => (d.y0 + d.y1) / 2)
          .attr('dy', '0.35em')
          .attr('text-anchor', 'middle')
        )
    }

    // Exit
    const tilesExit = tiles.exit()
    smartTransition(tilesExit, duration)
      .style('opacity', 0)
      .remove()
  }
}
