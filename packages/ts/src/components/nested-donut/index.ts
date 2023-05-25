import { Selection } from 'd3-selection'
import { arc } from 'd3-shape'
import { hierarchy, partition } from 'd3-hierarchy'
import { scaleLinear, ScaleLinear } from 'd3-scale'
import { group } from 'd3-array'

// Core
import { ComponentCore } from 'core/component'
import { SeriesDataModel } from 'data-models/series'

// Types
import { VerticalAlign } from 'types/text'

// Utils
import { getColor, getHexValue } from 'utils/color'
import { getNumber, getString, getValue, isNumber, isNumberWithinRange, merge } from 'utils/data'
import { smartTransition } from 'utils/d3'
import { wrapSVGText } from 'utils/text'

// Local Types
import { NestedDonutDirection, NestedDonutSegment, defaultLayerSettings, NestedDonutLayer } from './types'

// Config
import { NestedDonutConfig, NestedDonutConfigInterface } from './config'

// Modules
import { createArc, updateArc, removeArc } from './modules/arc'
import { createLabel, updateLabel, removeLabel } from './modules/label'

// Styles
import * as s from './style'

export class NestedDonut<Datum> extends ComponentCore<
Datum[],
NestedDonutConfig<Datum>,
NestedDonutConfigInterface<Datum>
> {
  static selectors = s
  static cssVariables = s.variables
  config: NestedDonutConfig<Datum> = new NestedDonutConfig()
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
    if (config) this.config.init(config)
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

    const layers = this._getLayerSettings()
    const data = this._getHierarchyData(layers)

    this.arcGen
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .innerRadius(d => d.y0)
      .outerRadius(d => d.y1)
      .cornerRadius(config.cornerRadius)

    this.g.attr('transform', `translate(${this._width / 2},${this._height / 2})`)

    // Layer backgrounds
    const backgrounds = this.arcBackground
      .selectAll<SVGPathElement, NestedDonutLayer>(`.${s.background}`)
      .data(layers, d => d._id)

    const backgroundsEnter = backgrounds.enter().append('path')
      .attr('class', s.background)
      .attr('visibility', config.showBackground ? null : 'hidden')

    const backgroundsMerged = backgrounds.merge(backgroundsEnter)
    smartTransition(backgroundsMerged, duration)
      .attr('d', d => this.arcGen({
        x0: config.angleRange?.[0] ?? config.angleRange?.[0] ?? 0,
        x1: config.angleRange?.[1] ?? config.angleRange?.[1] ?? 2 * Math.PI,
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
    const rootNode = config.value
      ? hierarchy(nestedData).sum(index => typeof index === 'number' && getNumber(data[index], config.value, index))
      : hierarchy(nestedData).count()
    const partitionData = partition().size([config.angleRange[1], 1])(rootNode) as NestedDonutSegment<Datum>

    partitionData.eachBefore(node => {
      const scale = this.colorScale.domain([-1, node.children?.length])

      const key = node.data[0] as string
      node.data = { key: key, root: node.parent?.data.root ?? key }

      if (isNumberWithinRange(node.depth - 1, [0, layers.length - 1])) {
        node._layer = layers[node.depth - 1]
        node._id = this.uid.replace(/-.*/gm, `-${key}`)
        node.y0 = node._layer._innerRadius
        node.y1 = node._layer._outerRadius
      }

      node.children?.forEach((child, i) => {
        child._index = i
        child._state = {
          fill:
            getColor(child, config.segmentColor, i, child.depth !== 1) ??
            scale.range(['#fff', getHexValue(node._state.fill, this.element)])(i),
        }
      })
    })
    const segments = partitionData.descendants().filter(d => d.parent && d.children && d.data.key)
    return segments
  }

  private _getLayerSettings (): NestedDonutLayer[] {
    const { direction, layers, layerPadding, layerSettings } = this.config

    const outerRadius = Math.min(this._width, this._height) / 2

    const layerItems = layers.reduceRight((arr, _, i) => {
      const layerId = direction === NestedDonutDirection.Outwards ? i : arr.length
      const layerConfig = merge(defaultLayerSettings, getValue(layerId, layerSettings))
      const radius = arr.length ? arr[0]._innerRadius - layerPadding : outerRadius
      arr.unshift({
        ...layerConfig,
        _id: layerId,
        _outerRadius: radius,
        _innerRadius: radius - layerConfig.width,
      })
      return arr
    }, new Array<NestedDonutLayer>())

    return direction === NestedDonutDirection.Inwards ? layerItems.reverse() : layerItems
  }
}
