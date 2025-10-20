import { Selection, select } from 'd3-selection'
import { hierarchy, HierarchyNode, treemap } from 'd3-hierarchy'
import { group, max, extent } from 'd3-array'
import { scaleLinear, scaleThreshold } from 'd3-scale'
import { hsl } from 'd3-color'
import { ComponentCore } from 'core/component'
import { SeriesDataModel } from 'data-models/series'
import { getColor, brighter, getHexValue } from 'utils/color'
import { getString, getNumber, isNumber } from 'utils/data'
import { smartTransition } from 'utils/d3'
import { trimSVGText, wrapSVGText } from 'utils/text'
import { TrimMode, FitMode } from 'types/text'
import { TreemapConfigInterface, TreemapDefaultConfig } from './config'
import { TreemapDatum, TreemapNode } from './types'
import * as s from './style'

export class Treemap<Datum> extends ComponentCore<Datum[], TreemapConfigInterface<Datum>> {
  static selectors = s
  protected _defaultConfig = TreemapDefaultConfig as TreemapConfigInterface<Datum>
  public config: TreemapConfigInterface<Datum> = this._defaultConfig

  /** Default number format for tile labels. */
  private _defaultNumberFormat (value: number): string {
    return `${value}`
  }

  datamodel: SeriesDataModel<Datum> = new SeriesDataModel()
  tiles: Selection<SVGGElement, unknown, SVGGElement, unknown>

  private _isTileLargeEnough (d: TreemapNode<Datum>): boolean {
    const w = d.x1 - d.x0
    const h = d.y1 - d.y0
    return (w >= this.config.minTileSizeForLabel) && (h >= this.config.minTileSizeForLabel)
  }

  private _getTileLightness (node: TreemapNode<Datum>, siblings: TreemapNode<Datum>[]): number {
    // Get the value extent of the sibling group
    const [minValue, maxValue] = extent(siblings, d => d.value)

    // If there's no range or no value, return default lightness
    if (minValue === maxValue || !node.value) return 0

    // Calculate relative position in the range (0 to 1)
    // Larger values will be closer to 0 (darker)
    return this.config.lightnessVariationAmount * ((maxValue - node.value) / (maxValue - minValue))
  }

  constructor (config?: TreemapConfigInterface<Datum>) {
    super()
    if (config) this.setConfig(config)
    this.tiles = this.g.append('g').attr('class', s.tiles)
  }

  _render (customDuration?: number): void {
    super._render(customDuration)
    const { config, datamodel: { data }, _width, _height } = this
    const { numberFormat } = config
    const formatNumber = numberFormat ?? this._defaultNumberFormat.bind(this)
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
      if (!node.children && node.parent) {
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
    treemapData.eachBefore((node) => {
      // Get base color: user accessor or default
      let color = config.tileColor
        ? getColor(node, config.tileColor)
        : getColor(node, undefined, node.parent?.children?.indexOf(node), node.depth !== 1)

      // Fallback to parent color if needed
      color = color ?? (node.parent as TreemapNode<Datum>)?._fill

      const hexColor = color ? getHexValue(color, this.g.node()) : null

      if (hexColor) {
        const hslColor = hsl(hexColor)

        // Lightness adjustment for siblings (if enabled)
        if (config.enableLightnessVariance && !node.children && node.parent) {
          const siblings = node.parent.children
          const lightnessAdjustment = this._getTileLightness(node, siblings)
          hslColor.l = Math.min(1, hslColor.l + lightnessAdjustment)
        }

        // Brightness increase for depth
        node._fill = brighter(hslColor.toString(), brightnessIncrease(node.depth))
      } else {
        node._fill = null
      }
    })

    // Render tiles
    const visibleNodes = descendants.filter(d => d.depth > 0)
    const tiles = this.tiles
      .selectAll<SVGGElement, TreemapNode<Datum>>(`g.${s.tileGroup}`)
      .data(visibleNodes, d => `${d.data.key}-${d.depth}`)

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
      .attr('width', d => Math.max(0, d.x1 - d.x0 - config.tilePadding))
      .attr('height', d => Math.max(0, d.y1 - d.y0))
      .attr('rx', rx)
      .attr('ry', rx)

    // Tile rectangles
    tilesEnter
      .append('rect')
      .classed(s.tile, true)
      .classed(s.clickableTile, d => config.showTileClickAffordance && !d.children)
      .attr('rx', rx)
      .attr('ry', rx)
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .style('fill', d => d._fill ?? getColor(d, config.tileColor))
      .style('opacity', 0)
      .style('cursor', config.showTileClickAffordance ? d => !d.children ? 'pointer' : null : null)


    const mergedTiles = tiles.merge(tilesEnter)

    smartTransition(mergedTiles.select(`rect.${s.tile}`), duration)
      .style('fill', d => d._fill ?? getColor(d, config.tileColor))
      .style('opacity', 1)
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)

    // Update clipPath rects
    mergedTiles.select('clipPath rect')
      .attr('width', d => d.x1 - d.x0 - 2 * config.tilePadding)
      .attr('height', d => d.y1 - d.y0 - 2 * config.tilePadding)

    tilesEnter
      .append('g')
      .attr('class', s.labelGroup)
      .attr('clip-path', d => `url(#clip-${d._id})`)
      .attr('transform', d => `translate(${d.x0 + config.labelOffsetX},${d.y0 + config.labelOffsetY})`)
      .append('text')
      .attr('class', s.label)
      .attr('x', 0)
      .attr('y', 0)
      .style('opacity', 0)

    const getTileLabel = config.tileLabel ?? ((d: TreemapNode<Datum>) => `${d.data.key}: ${formatNumber(d.value)}`)
    const textSelection = mergedTiles.selectAll<SVGTextElement, TreemapNode<Datum>>(`g.${s.labelGroup} text`)
    textSelection
      .text(d => getTileLabel(d))
      .style('font-size', function (d) {
        const sqrtVal = Math.sqrt(d.value ?? 0)
        return config.enableTileLabelFontSizeVariation && !d.children
          ? `${fontSizeScale(sqrtVal)}px`
          : `${fontSizeScale.range()[1]}px`
      })

    // Fit label (wrap or trim) and set dominant-baseline for tspans in one pass
    textSelection.each((d, i, nodes) => {
      const text = select(nodes[i] as SVGTextElement)
      const tileWidth = d.x1 - d.x0 - (config.labelOffsetX ?? 0) * 2
      const fullLabel = text.text()
      let fontSize = parseFloat(text.style('font-size'))
      if (!fontSize) {
        fontSize = parseFloat(window.getComputedStyle(nodes[i] as SVGTextElement).fontSize)
      }

      if (config.labelFit === FitMode.Wrap) {
        wrapSVGText(text, tileWidth)
      } else {
        trimSVGText(text, tileWidth, TrimMode.End, true, fontSize)
      }

      text.attr('title', fullLabel)
    })

    // Transition group position
    smartTransition(mergedTiles.select(`g.${s.labelGroup}`), duration)
      .attr('transform', d => `translate(${d.x0 + config.labelOffsetX},${d.y0 + config.labelOffsetY})`)

    // Transition text opacity only (fade-in)
    smartTransition(mergedTiles.select(`g.${s.labelGroup} text`), duration)
      .style('opacity', 1)

    // Hide labels that don't meet criteria
    mergedTiles.select(`text.${s.label}`)
      .style('display', d => {
        const isAllowedNode = config.labelInternalNodes ? true : !d.children
        return isAllowedNode && this._isTileLargeEnough(d) ? null : 'none'
      })
      // Make the internal labels semibold via class
      .attr('class', d => d.children ? `${s.label} ${s.internalLabel}` : s.label)

    smartTransition(tiles.exit(), duration)
      .style('opacity', 0)
      .remove()
  }
}
