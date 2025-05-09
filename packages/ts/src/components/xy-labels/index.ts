// Core
import { XYComponentCore } from 'core/xy-component'

// Utils
import { getValue, isNumber, isNumberWithinRange } from 'utils/data'
import { rectIntersect } from 'utils/misc'

// Local Types
import { XYLabelCluster, XYLabel, XYLabelPositioning } from './types'

// Config
import { XYLabelsDefaultConfig, XYLabelsConfigInterface } from './config'

// Modules
import { createLabels, updateLabels, removeLabels, getLabelRenderProps } from './modules/label'

// Styles
import * as s from './style'

export class XYLabels<Datum> extends XYComponentCore<Datum, XYLabelsConfigInterface<Datum>> {
  static selectors = s
  clippable = false
  protected _defaultConfig = XYLabelsDefaultConfig as XYLabelsConfigInterface<Datum>
  public config: XYLabelsConfigInterface<Datum> = this._defaultConfig

  events = {
    [XYLabels.selectors.label]: {},
  }

  constructor (config?: XYLabelsConfigInterface<Datum>) {
    super()
    if (config) this.setConfig(config)
  }

  _render (customDuration?: number): void {
    const { config } = this
    const duration = isNumber(customDuration) ? customDuration : config.duration

    const labelGroups = this.g
      .selectAll<SVGGElement, XYLabel<Datum> | XYLabelCluster<Datum>>(`.${s.labelGroup}`)
      .data(this._getDataToRender())

    const labelGroupsExit = labelGroups.exit<XYLabel<Datum> | XYLabelCluster<Datum>>()
    removeLabels(labelGroupsExit, duration)

    const labelGroupsEnter = labelGroups.enter().append('g')
      .attr('class', s.labelGroup)
      .call(createLabels)

    const labelGroupsMerged = labelGroupsEnter
      .merge(labelGroups)
      .classed(s.cluster, d => !!(d as XYLabelCluster<Datum>).records)
      .classed(s.label, d => !(d as XYLabelCluster<Datum>).records)

    labelGroupsMerged.call(updateLabels, config, duration)
  }

  private _getDataToRender (): (XYLabel<Datum> | XYLabelCluster<Datum>)[] {
    const { config, datamodel } = this

    const xRange = this.xScale.range() as [number, number]
    const yRange = this.yScale.range() as [number, number]

    const labels = datamodel.data?.reduce<XYLabel<Datum>[]>((acc, d) => {
      const xPositioning = getValue<Datum, XYLabelPositioning>(d, config.xPositioning)
      const yPositioning = getValue<Datum, XYLabelPositioning>(d, config.yPositioning)
      const props = getLabelRenderProps(d, this.element, config, this.xScale, this.yScale)

      if (
        ((xPositioning !== XYLabelPositioning.DataSpace) || isNumberWithinRange(props.x, xRange)) &&
        ((yPositioning !== XYLabelPositioning.DataSpace) || isNumberWithinRange(props.y, yRange))
      ) {
        acc.push({ ...d, _screen: props })
      }

      return acc
    }, []) ?? []

    return config.clustering ? this._getClusteredLabels(labels) : labels
  }

  private _getClusteredLabels (labels: XYLabel<Datum>[]): (XYLabel<Datum> | XYLabelCluster<Datum>)[] {
    const labelsNonOverlapping = [...labels]
    const clusterMap = new Map<XYLabel<Datum>, XYLabel<Datum>[]>()
    for (let i = 0; i < labelsNonOverlapping.length; i += 1) {
      const label1 = labelsNonOverlapping[i]
      for (let j = i + 1; j < labelsNonOverlapping.length; j += 1) {
        const label2 = labelsNonOverlapping[j]
        const isIntersecting = rectIntersect(label1._screen, label2._screen)
        if (isIntersecting) {
          if (!clusterMap.has(label1)) clusterMap.set(label1, [label1])
          clusterMap.get(label1).push(label2)
          labelsNonOverlapping.splice(j, 1)
          j -= 1
        }
      }

      if (clusterMap.has(label1)) {
        labelsNonOverlapping.splice(i, 1)
        i -= 1
      }
    }

    const clusters = Array.from(clusterMap.values()).map(records => ({
      _screen: getLabelRenderProps(records, this.element, this.config, this.xScale, this.yScale),
      records,
    }))

    return [...labelsNonOverlapping, ...clusters]
  }
}
