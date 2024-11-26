import { Selection } from 'd3-selection'

import { ComponentCore } from 'core/component'
import { SeriesDataModel } from 'data-models/series'
import { TreemapConfigInterface, TreemapDefaultConfig } from './config'
import { TreemapDatum } from './types'

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
    this.tiles = this.g.append('g')
  }

  _render (customDuration?: number): void {
    const { datamodel } = this
    // Basic render implementation to be extended
    const data: TreemapDatum<Datum>[] = datamodel.data.map((d, i) => ({
      index: i,
      datum: d,
    }))

    // eslint-disable-next-line no-console
    console.log(data)
  }
}
