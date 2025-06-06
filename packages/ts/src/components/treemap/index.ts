import { Selection, select } from 'd3-selection'
import { hierarchy, HierarchyNode, treemap } from 'd3-hierarchy'
import { group, max, extent } from 'd3-array'
import { scaleLinear, scaleThreshold } from 'd3-scale'
import { hsl } from 'd3-color'
import { wrapSVGText } from 'utils/text'
import { ComponentCore } from 'core/component'
import { SeriesDataModel } from 'data-models/series'
import { getColor, brighter, getHexValue, isDarkBackground } from 'utils/color'
import { getString, getNumber } from 'utils/data'
import { TreemapConfigInterface, TreemapDefaultConfig } from './config'
import { TreemapDatum, TreemapNode } from './types'

import * as s from './style' // Minimum pixel size for showing labels

const LIGHTNESS_VARIATION_AMOUNT = 0.08

const MIN_TILE_SIZE_FOR_LABEL = 20

const defaultNumberFormat = (value: number): string => `${value}`

export class Treemap<Datum> extends ComponentCore<Datum[], TreemapConfigInterface<Datum>> {
  static selectors = s
  protected _defaultConfig = TreemapDefaultConfig as TreemapConfigInterface<Datum>
  public config: TreemapConfigInterface<Datum> = this._defaultConfig

  datamodel: SeriesDataModel<Datum> = new SeriesDataModel()
  tiles: Selection<SVGGElement, unknown, SVGGElement, unknown>

  private isTileLargeEnough (d: TreemapNode<Datum>): boolean {
    const w = d.x1 - d.x0
    const h = d.y1 - d.y0
    return (w >= MIN_TILE_SIZE_FOR_LABEL) && (h >= MIN_TILE_SIZE_FOR_LABEL)
  }

  private getTileLightness (node: TreemapNode<Datum>, siblings: TreemapNode<Datum>[]): number {
    // Get the value extent of the sibling group
    const [minValue, maxValue] = extent(siblings, d => d.value)

    // If there's no range or no value, return default lightness
    if (minValue === maxValue || !node.value) return 0

    // Calculate relative position in the range (0 to 1)
    // Larger values will be closer to 0 (darker)
    return LIGHTNESS_VARIATION_AMOUNT * ((maxValue - node.value) / (maxValue - minValue))
  }

  constructor (config?: TreemapConfigInterface<Datum>) {
    super()
    if (config) this.setConfig(config)
    this.tiles = this.g.append('g').attr('class', s.tiles)
  }

  _render (): void {
    const { config, datamodel: { data }, _width, _height } = this
    const { numberFormat = defaultNumberFormat } = config

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

    // Create the hierarchy from the grouped data,
    // which by itself is not quite right because there is an extra
    // level of nesting that we don't want, just above the leaf nodes.
    const rootNode = hierarchy(nestedData)

    // Compute the aggregation
    if (config.value) {
      rootNode.sum(index => typeof index === 'number' && getNumber(data[index], config.value, index))
    } else {
      rootNode.count()
    }

    // Fix the hierarchy by removing the extra level of nesting
    rootNode.each(node => {
      if (!node.children) {
        node.parent.children = null
      }
    })

    const treemapLayout = treemap()
      .size([_width, _height])
      .round(true)
      .padding(config.tilePadding)

    // Apply padding to the top of each tile,
    // but not for the root node.
    if (this.config.tilePaddingTop !== undefined) {
      treemapLayout.paddingTop(d => d.parent ? config.tilePaddingTop : 0)
    }

    // Compute the treemap layout
    const treemapData = treemapLayout(rootNode) as TreemapNode<Datum>

    // Process the resulting hierarchy into the type we need
    let nodeId = 0
    treemapData.each(node => {
      const n = node as unknown as HierarchyNode<[string, number[]]>
      // Generate unique IDs for each node
      node._id = `node-${nodeId++}`

      const treemapDatum: TreemapDatum<Datum> = {
        key: n.data[0],
      }

      // Populate the index and datum for leaf nodes
      const isLeafNode = !n.children
      if (isLeafNode) {
        treemapDatum.index = n.data[1][0]
        treemapDatum.datum = data[treemapDatum.index]
      }

      node.data = treemapDatum
    })

    const descendants = treemapData.descendants()

    // Set up the brightness increase scale based on depth
    const maxDepth = max(descendants, d => d.depth)

    const brightnessIncrease = scaleLinear()
      .domain([1, maxDepth])
      .range([0, 1])

    // Get all leaf node values and calculate their square roots
    // (since area is proportional to value)
    const leafValues = descendants.filter(d => !d.children).map(d => d.value)
    const maxLeafValue = Math.sqrt(max(leafValues)) || 0

    // Divide the range into three equal intervals based on the square root of values
    // This accounts for the fact that area is proportional to value
    const fontSizeScale = scaleThreshold<number, number>()
      .domain([
        maxLeafValue / 3, // First third of the max value
        (maxLeafValue * 2) / 3, // Second third of the max value
      ])
      .range([
        config.tileLabelSmallFontSize,
        config.tileLabelMediumFontSize,
        config.tileLabelLargeFontSize,
      ])

    // First pass: Set base colors without considering tileColor config
    treemapData
      .eachBefore((node) => {
        if (!node.children) return
        const children = node.children

        children.forEach((treemapChild, i) => {
          // Use default color scheme without tileColor config
          let color = getColor(treemapChild, undefined, i, treemapChild.depth !== 1)
          color = color ?? (node as TreemapNode<Datum>)._fill

          const hexColor = color ? getHexValue(color, this.g.node()) : null

          if (hexColor) {
            const hslColor = hsl(hexColor)

            if (config.enableLightnessVariance) {
              if (!treemapChild.children) {
                const lightnessAdjustment = this.getTileLightness(treemapChild, children)
                hslColor.l = Math.min(1, hslColor.l + lightnessAdjustment)
              }
            }

            treemapChild._fill = brighter(hslColor.toString(), brightnessIncrease(treemapChild.depth))
          } else {
            treemapChild._fill = null
          }
        })
      })

    // Second pass: Apply tileColor config as an overlay
    if (config.tileColor) {
      treemapData
        .eachBefore((node) => {
          const color = getColor(node, config.tileColor)
          if (color !== null) {
            node._fill = color
          }
        })
    }

    // Render tiles
    const visibleNodes = descendants.filter(d => d.depth > 0)
    const tiles = this.tiles
      .selectAll<SVGGElement, TreemapNode<Datum>>(`g.${s.tileGroup}`)
      .data(visibleNodes, d => d._id)
    const tilesEnter = tiles
      .enter()
      .append('g')
      .attr('class', s.tileGroup)

    // Computes the rect border radius for a given tile.
    // The rx and ry values are the minimum of the tile
    // border radius and some fraction the width of the tile,
    // based on the tileBorderRadiusFactor config.
    // This ensures that the tile border radius is not
    // larger than the tile size, which makes small tiles
    // look better.
    const rx = (d: TreemapNode<Datum>): number =>
      Math.min(config.tileBorderRadius, (d.x1 - d.x0) * config.tileBorderRadiusFactor)

    // Add clipPath elements
    tilesEnter
      .append('clipPath')
      .attr('id', d => `clip-${d._id}`)
      .append('rect')
      .attr('rx', rx)
      .attr('ry', rx)

    // Tile rectangles
    tilesEnter
      .append('rect')
      .classed(s.tile, true)

      // Make the leaf tiles clickable if a click handler is provided
      .classed(s.clickableTile, d => config.showTileClickAffordance && !d.children)

      .attr('rx', rx)
      .attr('ry', rx)
      // Initialize tile positions so that the initial transition is smooth
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .style('fill', d => d._fill ?? getColor(d, config.tileColor))
      .style('opacity', 0)
      .style('cursor', config.showTileClickAffordance ? d => !d.children ? 'pointer' : null : null)

    tiles.merge(tilesEnter).select(`rect.${s.tile}`)
      .style('fill', d => d._fill ?? getColor(d, config.tileColor))
      .style('opacity', 1)
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)

    // Update clipPath rects
    tiles.merge(tilesEnter).select('clipPath rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('width', d => d.x1 - d.x0 - config.tilePadding)
      .attr('height', d => d.y1 - d.y0)

    // Tile labels
    tilesEnter
      .append('text')
      .attr('class', s.label)
      .attr('clip-path', d => `url(#clip-${d._id})`)
    // Update all labels first
    const mergedTiles = tiles.merge(tilesEnter)

    // Hide labels that don't meet criteria
    mergedTiles.select(`text.${s.label}`)
      .style('display', d => {
        const isAllowedNode = config.labelInternalNodes ? true : !d.children
        return isAllowedNode && this.isTileLargeEnough(d) ? null : 'none'
      })
      // Make the internal labels semibold
      .style('font-weight', d => d.children ? '500' : 'normal')

    // Update visible labels
    mergedTiles.select(`text.${s.label}`)
      .filter(d => {
        const isAllowedNode = config.labelInternalNodes ? true : !d.children
        return isAllowedNode && this.isTileLargeEnough(d)
      })
      .attr('clip-path', d => `url(#clip-${d._id})`)
      .attr('x', d => d.x0 + config.labelOffsetX)
      .attr('y', d => d.y0 + config.labelOffsetY)
      .each(function (d) {
        const text = select(this) as unknown as Selection<SVGTextElement, any, SVGElement, any>

        const label = `${d.data.key}: ${numberFormat(d.value)}`
        text.text(label)

        // Set text color based on background darkness
        const backgroundColor = d._fill ?? getColor(d, config.tileColor)
        const textColor = backgroundColor && isDarkBackground(backgroundColor) ? '#ffffff' : '#000000'
        text.style('fill', textColor)

        // Apply font size scaling only to leaf nodes if enabled
        if (!d.children && config.enableTileLabelFontSizeVariation) {
          text.style('font-size', `${fontSizeScale(Math.sqrt(d.value))}px`)
        }

        // Apply text wrapping to leaf nodes
        if (!d.children) {
          const availableWidth = d.x1 - d.x0 - (2 * config.labelOffsetX)
          wrapSVGText(text, availableWidth)
        }
      })

    // Exit
    tiles.exit().remove()
  }
}
