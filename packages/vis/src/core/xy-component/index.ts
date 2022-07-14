import { Selection } from 'd3-selection'

// Core
import { ComponentCore } from 'core/component'
import { SeriesDataModel } from 'data-models/series'

// Utils
import { filterDataByRange, getExtent, isArray } from 'utils/data'

// Types
import { NumericAccessor } from 'types/accessor'
import { ContinuousScale, Scale, ScaleDimension } from 'types/scale'

// Config
import { XYComponentConfig } from './config'

export class XYComponentCore<Datum> extends ComponentCore<Datum[]> {
  element: SVGGraphicsElement
  g: Selection<SVGGElement, unknown, null, undefined>
  config: XYComponentConfig<Datum>
  datamodel: SeriesDataModel<Datum> = new SeriesDataModel()
  /** Clippable components can be affected by a clipping path (set up in the container) */
  clippable = true
  /** Identifies whether the component displayed stacked data (eg StackedBar, Area) */
  stacked = false

  private _xScale: ContinuousScale = Scale.scaleLinear()
  private _yScale: ContinuousScale = Scale.scaleLinear()

  get xScale (): ContinuousScale {
    return this.config.xScale || this._xScale
  }

  get yScale (): ContinuousScale {
    return this.config.yScale || this._yScale
  }

  setScaleDomain (dimension: ScaleDimension, domain: number[]): void {
    if (dimension === ScaleDimension.X) this._xScale?.domain(domain)
    if (dimension === ScaleDimension.Y) this._yScale?.domain(domain)
  }

  setScaleRange (dimension: ScaleDimension, range: number[]): void {
    if (dimension === ScaleDimension.X) this._xScale?.range(range)
    if (dimension === ScaleDimension.Y) this._yScale?.range(range)
  }

  setScale (dimension: ScaleDimension, scale: ContinuousScale): void {
    if (scale && (dimension === ScaleDimension.X)) this._xScale = scale
    if (scale && (dimension === ScaleDimension.Y)) this._yScale = scale
  }

  getDataExtent (dimension: ScaleDimension, scaleByVisibleData: boolean): number[] {
    const { config, datamodel } = this

    switch (dimension) {
      case ScaleDimension.X: return this.getXDataExtent()
      case ScaleDimension.Y: return this.getYDataExtent(scaleByVisibleData)
      default: return getExtent(datamodel.data, config[dimension])
    }
  }

  getXDataExtent (): number[] {
    const { config, datamodel } = this
    return getExtent(datamodel.data, config.x)
  }

  getYDataExtent (scaleByVisibleData: boolean): number[] {
    const { config, datamodel } = this

    const data = scaleByVisibleData ? filterDataByRange(datamodel.data, this.xScale.domain() as [number, number], config.x) : datamodel.data
    const yAccessors = (isArray(config.y) ? config.y : [config.y]) as NumericAccessor<Datum>[]
    return getExtent(data, ...yAccessors)
  }
}
