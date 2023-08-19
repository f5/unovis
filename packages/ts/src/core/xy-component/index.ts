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
import { XYComponentConfig, XYComponentConfigInterface } from './config'

export class XYComponentCore<
  Datum,
  ConfigClass extends XYComponentConfig<Datum> = XYComponentConfig<Datum>,
  ConfigInterface extends Partial<XYComponentConfigInterface<Datum>> = Partial<XYComponentConfigInterface<Datum>>,
> extends ComponentCore<Datum[], ConfigClass, ConfigInterface> {
  element: SVGGraphicsElement
  g: Selection<SVGGElement, unknown, null, undefined>
  config: ConfigClass
  prevConfig: ConfigClass
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

  setConfig (config: ConfigInterface): void {
    // We don't allow changing scales after the component has been initialized
    if (this.config?.xScale) config.xScale = this.config.xScale
    if (this.config?.yScale) config.yScale = this.config.yScale

    super.setConfig(config)
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

  getAriaDescription (): string {
    const xDataExtent = this.getXDataExtent()
    const yDataExtent = this.getYDataExtent(true)
    let description
    if (xDataExtent[0] === undefined && xDataExtent[1] === undefined) {
      description = 'The extent of the X dimension is undefined '
    } else {
      description = `Extent of the ${ScaleDimension.X} dimension spans from ${xDataExtent[0]?.toFixed(2)} to ${xDataExtent[1]?.toFixed(2)} `
    }

    if (yDataExtent[0] === undefined && yDataExtent[1] === undefined) {
      description += 'The extent of the Y dimension is undefined'
    } else {
      description += `Extent of the ${ScaleDimension.Y} dimension spans from ${yDataExtent[0]?.toFixed(2)} to ${yDataExtent[1]?.toFixed(2)}`
    }

    return description
  }
}
