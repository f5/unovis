import { Selection, select } from 'd3-selection'
import { hierarchy, HierarchyNode, treemap } from 'd3-hierarchy'
import { group, max, extent } from 'd3-array'
import { scaleLinear, scaleThreshold } from 'd3-scale'
import { hsl } from 'd3-color'

// Core
import { ComponentCore } from 'core/component'

// Data Model
import { SeriesDataModel } from 'data-models/series'

// Utils
import { getColor, brighter, getHexValue, isColorDark } from 'utils/color'
import { getString, getNumber, isNumber, isFunction } from 'utils/data'
import { smartTransition } from 'utils/d3'
import { trimSVGText, wrapSVGText } from 'utils/text'
import { cssvar } from 'utils/style'

// Types
import { FitMode } from 'types/text'

// Config
import { TreemapConfigInterface, TreemapDefaultConfig } from './config'

// Local Types
import { HierarchyNodeWithValue, TreemapDatum, TreemapNode } from './types'

// Styles
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
    this.tiles = this.g.append('g').attr('class', s.tiles)
  }

  _render (customDuration?: number): void {
    super._render(customDuration)
    const { config, datamodel: { data }, _width, _height } = this
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
      rootNode.sum(index => isNumber(index) && getNumber(data[index], config.value, index))
    } else {
      rootNode.count()
    }

    // Fix the hierarchy by removing the extra level of nesting
    rootNode.each(node => {
      if (!node.children && node.parent) {
        node.parent.children = null
      }
    })

    // Process the hierarchy into the type we need
    const hierarchyWithPopulatedData = rootNode as HierarchyNodeWithValue<Datum>
    hierarchyWithPopulatedData.each(d => {
      const node = d as unknown as TreemapNode<Datum>
      const n = d as unknown as HierarchyNode<[string, number[]]>

      const isLeafNode = !n.children
      const treemapDatum: TreemapDatum<Datum> = {
        key: n.data[0],
        isLeaf: isLeafNode,
      }

      if (isLeafNode) {
        treemapDatum.index = n.data[1][0]
        treemapDatum.datum = data[treemapDatum.index]
      }

      node.data = treemapDatum
      node._id = `node-${node.data.key}-${node.depth}`
      node.topLevelParent = this._getTopLevelParent(node)
    })

    if (config.timeSort && config.timeSort === null) hierarchyWithPopulatedData.sort(config.timeSort)

    const treemapLayout = treemap<TreemapDatum<Datum>>()
      .size([_width, _height])
      .round(true)
      .padding(config.tilePadding)

    if (config.tileFunction) treemapLayout.tile(config.tileFunction)

    if (this.config.tilePaddingTop !== undefined) {
      treemapLayout.paddingTop(d => d.parent ? config.tilePaddingTop : 0)
    }

    // Compute the treemap layout
    const treemapData = treemapLayout(hierarchyWithPopulatedData as HierarchyNode<TreemapDatum<Datum>>) as TreemapNode<Datum>
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

    const visibleTiles = descendants.filter(d => d.depth > 0)
    const firstLevelTiles = visibleTiles.filter(d => d.depth === 1)
    const nonFirstLevelTiles = visibleTiles.filter(d => d.depth > 1)

    // Set the fill color for the first level tiles
    firstLevelTiles.forEach((d, i) => {
      d._fill = getColor(d, config.tileColor, i)
    })

    // Set the fill color for the non-first level tiles
    nonFirstLevelTiles.forEach((d, i) => {
      const providedColor = getColor(d, config.tileColor, i, true)
      if (providedColor) {
        d._fill = providedColor
        return
      }

      const hslColor = hsl(getHexValue(d.parent?._fill, this.element))

      if (config.enableLightnessVariance && !d.children && d.parent) {
        const siblings = d.parent.children
        const lightnessAdjustment = this._getTileLightness(d, siblings)
        hslColor.l = Math.min(1, hslColor.l + lightnessAdjustment)
      }

      d._fill = brighter(hslColor.toString(), brightnessIncrease(d.depth))
    })


    /* Render tiles */
    const tiles = this.tiles
      .selectAll<SVGGElement, TreemapNode<Datum>>(`g.${s.tileGroup}:not(.${s.tileExiting})`)
      .data(visibleTiles, d => `${d.data.key}-${d.depth}`)

    const tilesEnter = tiles.enter()
      .append('g')
      .attr('class', s.tileGroup)

    // Add clipPath elements
    tilesEnter
      .append('clipPath')
      .append('rect')
      .attr('rx', d => this._getTileBorderRadius(d))
      .attr('ry', d => this._getTileBorderRadius(d))

    // Tile rectangles
    const tileEnterRects = tilesEnter
      .append('rect')
      .classed(s.tile, true)
      .classed(s.clickableTile, d => config.showTileClickAffordance && !d.children)
      .attr('rx', d => this._getTileBorderRadius(d))
      .attr('ry', d => this._getTileBorderRadius(d))
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('width', this._getTileWidth)
      .attr('height', this._getTileHeight)
      .style('fill', d => d._fill)
      .style('opacity', 0)
      .style('cursor', config.showTileClickAffordance ? d => !d.children ? 'pointer' : null : null)

    if (config.tileShowHtmlTooltip) tileEnterRects.append('title')

    tilesEnter
      .append('g')
      .attr('class', s.labelGroup)
      .attr('transform', d => `translate(${d.x0 + config.labelOffsetX},${d.y0 + config.labelOffsetY})`)
      .style('opacity', 0)
      .append('text')
      .attr('class', s.label)
      .attr('x', 0)
      .attr('y', 0)

    /* Update */
    const tilesMerged = tiles.merge(tilesEnter)

    // Update clipPath elements
    tilesMerged.select<SVGClipPathElement>('clipPath')
      .attr('id', d => `clip-${this.uid}-${d._id}`)

    tilesMerged.select('clipPath rect')
      .attr('width', d => Math.max(this._getTileWidth(d) - 2 * config.labelOffsetX, 0))
      .attr('height', d => Math.max(this._getTileHeight(d) - 2 * config.labelOffsetY, 0))

    const tileRectsMerged = tilesMerged.select(`rect.${s.tile}`)
    smartTransition(tileRectsMerged, duration)
      .style('fill', d => d._fill)
      .style('opacity', 1)
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('width', this._getTileWidth)
      .attr('height', this._getTileHeight)

    const tileTitlesMerged = tileRectsMerged.select('title')
    if (config.tileShowHtmlTooltip) tileTitlesMerged.text(d => config.tileLabel(d))
    else tileTitlesMerged.remove()

    // Apply clip-path to labels
    const labelGroupsMerged = tilesMerged.select<SVGGElement>(`g.${s.labelGroup}`)
      .attr('clip-path', d => `url(#clip-${this.uid}-${d._id})`)

    // Transition group position and text opacity (fade-in)
    smartTransition(labelGroupsMerged, duration)
      .attr('transform', d => `translate(${d.x0 + config.labelOffsetX},${d.y0 + config.labelOffsetY})`)
      .style('opacity', 1)

    const textSelection = tilesMerged.select<SVGTextElement>(`g.${s.labelGroup} text`)
    textSelection
      .text(d => {
        const shouldShowLabel = config.labelInternalNodes ? true : !d.children
        const isLargeEnough = this._isTileLargeEnough(d)
        return (shouldShowLabel && isLargeEnough && isFunction(config.tileLabel)) ? config.tileLabel(d) : null
      })
      .property('font-size-px', d => {
        const sqrtVal = Math.sqrt(d.value ?? 0)
        return config.enableTileLabelFontSizeVariation && !d.children
          ? fontSizeScale(sqrtVal)
          : null // Use the default css variable value
      })
      .style('font-size', (_, i, els) => `${select(els[i]).property('font-size-px')}px`)
      .style('fill', d => cssvar(
        isColorDark(d._fill) ? s.variables.treemapLabelTextColorLight : s.variables.treemapLabelTextColor)
      )

    // Fit label (wrap or trim)
    textSelection.each((d, i, els) => {
      const isLeafNode = !d.children
      const el = els[i] as SVGTextElement
      if (!el.textContent) return

      const text = select(el)
      const maxLabelWidth = d.x1 - d.x0 - (config.labelOffsetX ?? 0) * 2
      const fontSize = parseFloat(text.property('font-size-px')) || parseFloat(window.getComputedStyle(el).fontSize)

      if (config.labelFit === FitMode.Wrap && isLeafNode) {
        wrapSVGText(text, maxLabelWidth)
      } else {
        trimSVGText(text, maxLabelWidth, config.labelTrimMode, true, fontSize)
      }
    })

    // Make the internal labels semibold via class
    tilesMerged.select(`text.${s.label}`)
      .classed(s.internalLabel, d => !!d.children)

    /* Exit */
    const tilesExit = tiles.exit()
      .classed(s.tileExiting, true)

    smartTransition(tilesExit, duration)
      .style('opacity', 0)
      .remove()
  }

  private _isTileLargeEnough (d: TreemapNode<Datum>): boolean {
    const w = this._getTileWidth(d)
    const h = this._getTileHeight(d)
    return (w >= this.config.minTileSizeForLabel) && (h >= this.config.minTileSizeForLabel)
  }

  private _getTopLevelParent (node: TreemapNode<Datum>): TreemapNode<Datum> | undefined {
    if (node.depth === 1) return node
    if (node.depth > 1) {
      let current = node.parent
      while (current && current.depth > 1) {
        current = current.parent
      }
      return current?.depth === 1 ? current as TreemapNode<Datum> : undefined
    }

    return undefined
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

  // Computes the rect border radius for a given tile. The rx and ry values are the minimum of the tile
  // border radius and some fraction the width of the tile, based on the tileBorderRadiusFactor config.
  // This ensures that the tile border radius is not larger than the tile size, which makes small tiles
  // look better.
  private _getTileBorderRadius (d: TreemapNode<Datum>): number {
    return Math.min(this.config.tileBorderRadius, this._getTileWidth(d) * this.config.tileBorderRadiusFactor)
  }

  private _getTileHeight (d: TreemapNode<Datum>): number {
    return Math.max(d.y1 - d.y0, 0.5)
  }

  private _getTileWidth (d: TreemapNode<Datum>): number {
    return Math.max(d.x1 - d.x0, 0.5)
  }
}
