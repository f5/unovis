import { Selection } from 'd3-selection'
import { hierarchy, treemap } from 'd3-hierarchy'
import { group, max } from 'd3-array'
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

    // Map each layer accessor function to get string values from the data array
    const layerAccessors = config.layers.map(layerAccessor => {
      return (i: number) => getString(data[i], layerAccessor, i)
    })

    // Group the data indices by the layer accessors to create a hierarchical structure
    const nestedData = group(data.keys(), ...layerAccessors as [(d: number) => string])

    const rootNode = config.value !== undefined
      ? hierarchy(nestedData).sum(index => typeof index === 'number' && getNumber(data[index], config.value, index))
      : hierarchy(nestedData).count()

    const treemapLayout = treemap()
      .size([this._width, this._height])
      .round(true)
      .padding(this.config.tilePadding)

    const treemapData = treemapLayout(rootNode) as TreemapNode<Datum>

    const descendants = treemapData.descendants()

    const maxDepth = max(descendants, d => d.depth)
    const opacity = scaleLinear()
      .domain([1, maxDepth])
      .range([1, 0.2])

    treemapData
      .eachBefore((node) => {
        if (!node.children) return
        node.children.forEach((child, i) => {
          const treemapChild = child as TreemapNode<Datum>
          const color = getColor(treemapChild, config.tileColor, i, treemapChild.depth !== 1)
          treemapChild._state = {
            // If no color for this child, use the parent's color
            fill: color ?? (node as TreemapNode<Datum>)._state?.fill,
            fillOpacity: color === null ? opacity(treemapChild.depth) : null,
          }
        })
      })

    // Render tiles
    const visibleNodes = descendants.filter(d => d.depth > 0)
    const tiles = this.tiles
      .selectAll<SVGGElement, TreemapNode<Datum>>('g')
      .data(visibleNodes, d => d._id)
    const tilesEnter = tiles.enter().append('g')

    // Tile background rectangles
    tilesEnter.append('rect').classed('background', true)
    tiles.merge(tilesEnter).select('rect.background')
      .style('fill', '#ffffff')
      .call(selection => smartTransition(selection, duration)
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
      )

    // Tile foreground rectangles
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

    // Tile labels
    tilesEnter.append('text').classed('label', true)
    tiles.merge(tilesEnter)
      .filter(d => !d.children) // Leaf nodes only
      .select('text.label')
      // TODO move to Emotion
      .style('fill', '#000000')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .attr('x', d => (d.x0 + d.x1) / 2)
      .attr('y', d => (d.y0 + d.y1) / 2)
      .text(d => d.value)

    // Exit
    const tilesExit = tiles.exit()
    smartTransition(tilesExit, duration)
      .style('opacity', 0)
      .remove()
  }
}
