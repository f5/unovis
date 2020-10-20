// Copyright (c) Volterra, Inc. All rights reserved.
import { Selection } from 'd3-selection'
import { pie, arc } from 'd3-shape'

// Core
import { ComponentCore } from 'core/component'
import { SeriesDataModel } from 'data-models/series'

// Utils
import { getValue, isNumber, clamp } from 'utils/data'

// Types
import { Spacing } from 'types/misc'
import { DonutArcDatum, DonutArcAnimState } from 'types/donut'

// Config
import { DonutConfig, DonutConfigInterface } from './config'

// Modules

import { createArc, updateArc, removeArc } from './modules/arc'

// Styles
import * as s from './style'

export class Donut<Datum> extends ComponentCore<Datum[]> {
  static selectors = s
  config: DonutConfig<Datum> = new DonutConfig()
  datamodel: SeriesDataModel<Datum> = new SeriesDataModel()

  arcGroup: Selection<SVGGElement, DonutArcDatum<Datum>[], SVGGElement, DonutArcDatum<Datum>[]>
  centralLabel: Selection<SVGGElement, Datum, SVGGElement, Datum>
  arcGen = arc<DonutArcAnimState>()

  events = {
  }

  constructor (config?: DonutConfigInterface<Datum>) {
    super()
    if (config) this.config.init(config)
    this.arcGroup = this.g.append('g')
    this.centralLabel = this.g.append('text')
      .attr('class', s.centralLabel)
  }

  get bleed (): Spacing {
    return { top: 0, bottom: 0, left: 0, right: 0 }
  }

  _render (customDuration?: number): void {
    const { config, datamodel, bleed } = this
    const data = datamodel.data
    const duration = isNumber(customDuration) ? customDuration : config.duration

    const radius = config.radius || Math.min(config.width - bleed.left - bleed.right, config.height - bleed.top - bleed.bottom) / 2

    this.arcGen
      .startAngle(d => d.startAngle)
      .endAngle(d => d.endAngle)
      .innerRadius(d => d.innerRadius)
      .outerRadius(d => d.outerRadius)
      .padAngle(config.padAngle)
      .cornerRadius(d => config.cornerRadius)

    const pieGen = pie<Datum>()
      .startAngle(config.angleRange[0] ?? 0)
      .endAngle(config.angleRange[1] ?? 2 * Math.PI)
      .padAngle(config.padAngle)
      .value(d => getValue(d, config.value) || (config.preventEmptySegments && Number.EPSILON) || 0)
      .sort(config.sortFunction)

    this.arcGroup.attr('transform', `translate(${config.width / 2},${config.height / 2})`)
    const arcData = pieGen(data) as DonutArcDatum<Datum>[]
    arcData.forEach(d => {
      d.innerRadius = config.arcWidth === 0 ? 0 : clamp(radius - config.arcWidth, 0, radius - 1)
      d.outerRadius = radius
    })

    // Arc segments
    const arcsSelection = this.arcGroup
      .selectAll(`.${s.segment}`)
      .data(arcData)

    const arcsEnter = arcsSelection.enter().append('path')
      .attr('class', s.segment)
      .call(createArc, config)

    const arcsMerged = arcsSelection.merge(arcsEnter)
    arcsMerged.call(updateArc, config, this.arcGen, duration)

    arcsSelection.exit()
      .call(removeArc, duration)

    // Label
    this.centralLabel
      .attr('transform', `translate(${config.width / 2},${config.height / 2})`)
      .text(config.centralLabel ?? null)
  }
}
