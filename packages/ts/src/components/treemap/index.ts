import { Selection } from 'd3-selection'
import { hierarchy, treemap } from 'd3-hierarchy'
import { group } from 'd3-array'

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
    const nestedData = group(data.keys(), ...layerAccessors)

    const root = config.value !== undefined
      ? hierarchy(nestedData).sum(index => typeof index === 'number' && getNumber(data[index], config.value, index))
      : hierarchy(nestedData).count()

    const treemapLayout = treemap<[string, number[]]>()
      .size([this._width, this._height])
      .round(true)
      .padding(this.config.padding)

    const nodes = treemapLayout(root)
      .descendants()
      .filter(d => d.depth > 0)
      .map(n => {
        const node = n as TreemapNode<Datum>
        node.data = {
          datum: Array.isArray(n.data[1]) ? data[n.data[1][0]] : undefined,
          index: Array.isArray(n.data[1]) ? n.data[1][0] : -1,
        }
        return node
      })

    // Render tiles
    const tiles = this.tiles.selectAll<SVGGElement, TreemapNode<Datum>>('g')
      .data(nodes, d => d.data.index.toString())

    const tilesEnter = tiles.enter().append('g')

    // Rectangles
    tilesEnter.append('rect')
    tiles.merge(tilesEnter).select('rect')
      .style('fill', d => getColor(d, config.tileColor))
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
