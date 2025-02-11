import { Selection, select } from 'd3-selection'
import { hierarchy, treemap } from 'd3-hierarchy'
import { group, max, extent } from 'd3-array'
import { scaleLinear, scaleSqrt } from 'd3-scale'
import { hsl } from 'd3-color'
import { wrapSVGText } from 'utils/text'
import { ComponentCore } from 'core/component'
import { SeriesDataModel } from 'data-models/series'
import { getColor, brighter, getHexValue, isDarkBackground } from 'utils/color'
import { getString, getNumber, isNumber } from 'utils/data'
import { smartTransition } from 'utils/d3'
import { TreemapConfigInterface, TreemapDefaultConfig } from './config'
import { TreemapNode } from './types'

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

  _render (customDuration?: number): void {
    const { config, datamodel: { data }, _width, _height } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration
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
    rootNode.each(d => {
      if (!d.children) {
        d.parent.children = null
      }
    })

    const treemapLayout = treemap()
      .size([_width, _height])
      .round(true)
      .padding(config.tilePadding)

    if (this.config.tilePaddingTop !== undefined) {
      treemapLayout.paddingTop(config.tilePaddingTop)
    }

    // Generate unique IDs for each node before creating the treemap layout
    let nodeId = 0
    rootNode.each(d => {
      (d as unknown as TreemapNode<Datum>)._id = `node-${nodeId++}`
    })

    const treemapData = treemapLayout(rootNode) as TreemapNode<Datum>
    const descendants = treemapData.descendants()

    // Set up the brightness increase scale based on depth
    const maxDepth = max(descendants, d => d.depth)
    // Get value extent only from leaf nodes
    const [minValue, maxValue] = extent(descendants.filter(d => !d.children), d => d.value)

    const brightnessIncrease = scaleLinear()
      .domain([1, maxDepth])
      .range([0, 1])

    // Create font size scale for leaf nodes using sqrt scale
    const fontSizeScale = scaleSqrt()
      .domain([minValue || 1, maxValue || 1])
      .range([config.tileLabelMinFontSize, config.tileLabelMaxFontSize])
      .clamp(true)

    // Set fill color and opacity for each node
    treemapData
      .eachBefore((node) => {
        if (!node.children) return
        // Get all children for value comparison
        const children = node.children as TreemapNode<Datum>[]

        children.forEach((child, i) => {
          const treemapChild = child as TreemapNode<Datum>

          // Calculate base color for this child using the color accessor function
          let color = getColor(treemapChild, config.tileColor, i, treemapChild.depth !== 1)

          // If no color for this child, use the parent's color
          color = color ?? (node as TreemapNode<Datum>)._fill

          // Convert CSS variables to hex values if needed
          const hexColor = color ? getHexValue(color, this.g.node()) : null

          if (hexColor) {
            // Convert to HSL for easier lightness manipulation
            const hslColor = hsl(hexColor)

            if (config.enableLightnessVariance) {
              // Only apply lightness variation to leaf nodes
              if (!treemapChild.children) {
                const lightnessAdjustment = this.getTileLightness(treemapChild, children)
                hslColor.l = Math.min(1, hslColor.l + lightnessAdjustment)
              }
            }

            // Make the color brighter based on depth
            treemapChild._fill = brighter(hslColor.toString(), brightnessIncrease(treemapChild.depth))
          } else {
            treemapChild._fill = null
          }
        })
      })

    // Render tiles
    const visibleNodes = descendants.filter(d => d.depth > 0)
    const tiles = this.tiles
      .selectAll<SVGGElement, TreemapNode<Datum>>(`g.${s.tileGroup}`)
      .data(visibleNodes, d => d._id)
    const tilesEnter = tiles
      .enter()
      .append('g')
      .attr('class', s.tileGroup)

    // Add clipPath elements
    tilesEnter
      .append('clipPath')
      .attr('id', d => `clip-${d._id}`)
      .append('rect')
      .attr('rx', config.tileBorderRadius)
      .attr('ry', config.tileBorderRadius)

    // Tile rectangles
    tilesEnter
      .append('rect')
      .attr('class', s.tile)
      .attr('rx', config.tileBorderRadius)
      .attr('ry', config.tileBorderRadius)
      // Initialize tile positions so that the initial transition is smooth
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .style('fill', d => d._fill ?? getColor(d, config.tileColor))
      .style('opacity', 0)

    tiles.merge(tilesEnter).select(`rect.${s.tile}`)
      .call(selection => smartTransition(selection, duration)
        .style('fill', d => d._fill ?? getColor(d, config.tileColor))
        .style('opacity', 1)
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
      )

    // Update clipPath rects
    tiles.merge(tilesEnter).select('clipPath rect')
      .call(selection => smartTransition(selection, duration)
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
      )

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

        // @ts-expect-error This is a workaround for the D3 types
        const label = `${d.data[0]}: ${numberFormat(d.value)}`
        text.text(label)

        // Set text color based on background darkness
        const backgroundColor = d._fill ?? getColor(d, config.tileColor)
        const textColor = backgroundColor && isDarkBackground(backgroundColor) ? '#ffffff' : '#000000'
        text.style('fill', textColor)

        // Apply font size scaling only to leaf nodes if enabled
        if (!d.children && config.enableTileLabelFontSizeVariation) {
          text.style('font-size', `${fontSizeScale(d.value)}px`)
        }

        // Apply text wrapping to leaf nodes
        if (!d.children) {
          const availableWidth = d.x1 - d.x0 - (2 * config.labelOffsetX)
          wrapSVGText(text, availableWidth)
        }
      })

    // Exit
    const tilesExit = tiles.exit()
    smartTransition(tilesExit, duration)
      .style('opacity', 0)
      .remove()
  }
}
