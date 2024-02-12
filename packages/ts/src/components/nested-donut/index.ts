import { Selection } from 'd3-selection'
import { arc, pie } from 'd3-shape'
import { hierarchy, HierarchyNode, partition } from 'd3-hierarchy'
import { scaleLinear, ScaleLinear } from 'd3-scale'
import { group } from 'd3-array'

// Core
import { ComponentCore } from 'core/component'
import { SeriesDataModel } from 'data-models/series'

// Types
import { VerticalAlign } from 'types/text'

// Utils
import { getColor } from 'utils/color'
import { smartTransition } from 'utils/d3'
import { getNumber, getString, getValue, isNumber, isNumberWithinRange, merge } from 'utils/data'
import { getPixelValue } from 'utils/misc'
import { cssvar } from 'utils/style'
import { wrapSVGText } from 'utils/text'

// Local Types
import { NestedDonutDirection, NestedDonutSegment, NestedDonutLayer, NestedDonutSegmentLabelAlignment } from './types'

// Config
import { NestedDonutDefaultConfig, NestedDonutConfigInterface } from './config'

// Modules
import { createArc, updateArc, removeArc } from './modules/arc'
import { createLabel, updateLabel, removeLabel } from './modules/label'

// Styles
import * as s from './style'

export class NestedDonut<Datum> extends ComponentCore<
Datum[],
NestedDonutConfigInterface<Datum>
> {
  static selectors = s
  static cssVariables = s.variables
  protected _defaultConfig = NestedDonutDefaultConfig as NestedDonutConfigInterface<Datum>
  public config: NestedDonutConfigInterface<Datum> = this._defaultConfig
  datamodel: SeriesDataModel<Datum> = new SeriesDataModel()

  arcBackground: Selection<SVGGElement, unknown, SVGGElement, unknown>
  arcGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>
  centralLabel: Selection<SVGTextElement, unknown, SVGGElement, unknown>
  centralSubLabel: Selection<SVGTextElement, unknown, SVGGElement, unknown>

  arcGen = arc<Partial<NestedDonutSegment<Datum>>>()
  colorScale: ScaleLinear<string, string> = scaleLinear()

  events = { }

  constructor (config?: NestedDonutConfigInterface<Datum>) {
    super()
    if (config) this.setConfig(config)
    this.arcBackground = this.g.append('g')
    this.arcGroup = this.g.append('g')
      .attr('class', s.segmentsGroup)
    this.centralLabel = this.g.append('text')
      .attr('class', s.centralLabel)
    this.centralSubLabel = this.g.append('text')
      .attr('class', s.centralSubLabel)
  }

  _render (customDuration?: number): void {
    const { config } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration

    if (config.layers === undefined || config.layers.length === 0) {
      console.warn('Unovis | Nested Donut: No layers defined.')
      return
    }
    const layers = this._getLayerSettings()
    const data = this._getHierarchyData(layers)

    this.arcGen
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .innerRadius(d => d.y0)
      .outerRadius(d => d.y1)
      .cornerRadius(config.cornerRadius)

    this.arcGroup.attr('transform', `translate(${this._width / 2},${this._height / 2})`)
    this.arcBackground.attr('transform', `translate(${this._width / 2},${this._height / 2})`)
    this.centralLabel.attr('transform', `translate(${this._width / 2},${this._height / 2})`)
    this.centralSubLabel.attr('transform', `translate(${this._width / 2},${this._height / 2})`)

    // Layer backgrounds
    const backgrounds = this.arcBackground
      .selectAll<SVGPathElement, NestedDonutLayer>(`.${s.background}`)
      .data(layers, d => d._id)

    const backgroundsEnter = backgrounds.enter().append('path')
      .attr('class', s.background)
      .attr('visibility', config.showBackground ? null : 'hidden')

    const backgroundsMerged = backgrounds.merge(backgroundsEnter)
      .style('transition', `fill ${duration}ms`)
      .style('fill', d => d.backgroundColor)

    smartTransition(backgroundsMerged, duration)
      .attr('d', d => this.arcGen({
        x0: config.angleRange?.[0] ?? 0,
        x1: config.angleRange?.[1] ?? 2 * Math.PI,
        y0: d._innerRadius,
        y1: d._outerRadius,
      }))

    smartTransition(backgrounds.exit(), duration)
      .style('opacity', 0)
      .remove()

    // Segments
    const segments = this.arcGroup.selectAll<SVGGElement, NestedDonutSegment<Datum>>(`${s.segment}`)
      .data(data, d => d._id)

    const segmentsEnter = segments.enter()
      .append('g')
      .attr('class', s.segment)

    segments.merge(segmentsEnter)
    smartTransition(segments.exit(), duration)
      .attr('class', s.segmentExit)
      .style('opacity', 0)
      .remove()

    // Segment arcs
    const arcs = this.arcGroup
      .selectAll<SVGPathElement, NestedDonutSegment<Datum>>(`.${s.segmentArc}`)
      .data(data, d => d._id)

    const arcsEnter = segmentsEnter.append('path')
      .attr('class', s.segmentArc)
      .call(createArc, config)

    arcs.merge(arcsEnter)
      .call(updateArc, config, this.arcGen, duration)

    arcs.exit<NestedDonutSegment<Datum>>()
      .attr('class', s.segmentExit)
      .call(removeArc, duration)

    // Segment labels
    if (config.showSegmentLabels) {
      const labels = this.arcGroup
        .selectAll<SVGTextElement, NestedDonutSegment<Datum>>(`.${s.segmentLabel}`)
        .data(data, d => d._id)

      const labelsEnter = segmentsEnter.append('text')
        .attr('class', s.segmentLabel)
        .call(createLabel, this.arcGen)

      labels.merge(labelsEnter)
        .call(updateLabel, config, this.arcGen, duration)

      labels.exit<NestedDonutSegment<Datum>>()
        .call(removeLabel, duration)
    }

    // Chart labels
    this.centralLabel
      .attr('dy', config.centralSubLabel ? '-0.55em' : null)
      .text(config.centralLabel ?? null)

    this.centralSubLabel
      .attr('dy', config.centralLabel ? '0.55em' : null)
      .text(config.centralSubLabel ?? null)

    if (config.centralSubLabelWrap) wrapSVGText(this.centralSubLabel, layers[0]._innerRadius * 1.9, VerticalAlign.Top)
  }

  private _getHierarchyData (layers: NestedDonutLayer[]): NestedDonutSegment<Datum>[] {
    const { config, datamodel: { data } } = this

    const layerAccessors = config.layers?.map(layerAccessor => (i: number) => getString(data[i], layerAccessor, i))
    const nestedData = group(data.keys(), ...layerAccessors as [(i: number) => string])

    const rootNode = config.value !== undefined
      ? hierarchy(nestedData).sum(index => typeof index === 'number' && getNumber(data[index], config.value, index))
      : hierarchy(nestedData).count()

    const partitionData = partition().size([config.angleRange[1], 1])(rootNode) as NestedDonutSegment<Datum>

    partitionData
      .each(node => {
        // Starting with the root, we transform the original data returned from d3.hierarchy
        const n = node as unknown as HierarchyNode<[string, number[]]>
        node.data = {
          key: n.data[0],
          values: Array.isArray(n.data[1]) ? (n.data[1] as number[]).map(i => data[i]) : [],
          root: node.parent?.data?.root ?? n.data[0],
        }
        node._id = `root${partitionData.path(node).map(d => d.data.key).join('->')}`
        if (isNumberWithinRange(node.depth - 1, [0, layers.length - 1])) {
          node._layer = layers[node.depth - 1]
          node.y0 = node._layer._innerRadius
          node.y1 = node._layer._outerRadius
        }
      })
      .eachBefore((node) => {
        // Once ancestors have been visited, children properties that are
        // dependent on the parent's data are populated here
        if (!node.children || node.depth === rootNode.height - 1) return

        const positions = pie<NestedDonutSegment<Datum>>()
          .startAngle(node.parent ? node.x0 : config.angleRange?.[0])
          .endAngle(node.parent ? node.x1 : config.angleRange?.[1])
          .value(d => config.showEmptySegments && d.value === 0
            ? config.emptySegmentAngle
            : (d.x1 - d.x0))
          .sort(config.sort)(node.children)

        const opacity = scaleLinear()
          .domain([-1, node.children.length])
          .range([node._state?.fillOpacity ?? 1, 0])

        node.children.forEach((child, i) => {
          child._index = i
          child.x0 = positions[i].startAngle
          child.x1 = positions[i].endAngle

          // Default to parent's fill if segmentColor accessor is not provided
          const color = getColor(child, config.segmentColor, positions[i].index, child.depth !== 1)
          child._state = {
            fill: color ?? node._state.fill,
            fillOpacity: color === null ? opacity(positions[i].index) : null,
          }
        })
      })
      .eachAfter(node => {
        // Once hierarchy has been traversed, we append children data the parent
        // parent.data serves as a reference to all the original data it represents
        node.children?.forEach(ch => node.data.values.push(...ch.data.values))
      })

    const segments = partitionData.descendants().filter(d => d.parent?.value && d.data.key)
    return segments
  }

  private _getLayerSettings (): NestedDonutLayer[] {
    const { direction, layers, layerPadding, layerSettings } = this.config

    const outerRadius = Math.min(this._width, this._height) / 2

    const defaultLayerSettings = {
      backgroundColor: cssvar(s.variables.nestedDonutBackgroundColor),
      labelAlignment: NestedDonutSegmentLabelAlignment.Perpendicular,
      width: outerRadius * 0.75 / layers.length,
    }
    const layerItems = layers.reduceRight((arr, _, i) => {
      const layerId = direction === NestedDonutDirection.Outwards ? i : arr.length
      const layerConfig = merge(defaultLayerSettings, getValue(layerId, layerSettings))
      const radius = arr.length ? arr[0]._innerRadius - layerPadding : outerRadius
      const layerWidth = getPixelValue(layerConfig.width)
      if (layerWidth === null) {
        console.warn(`Unovis | Nested Donut: Could not parse width ${layerConfig.width}. Setting to default.`)
      }
      arr.unshift({
        ...layerConfig,
        _id: layerId,
        _outerRadius: radius,
        _innerRadius: radius - (layerWidth ?? defaultLayerSettings.width),
      })
      return arr
    }, new Array<NestedDonutLayer>())

    return direction === NestedDonutDirection.Inwards ? layerItems.reverse() : layerItems
  }
}
