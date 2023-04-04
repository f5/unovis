// Utils
import { cloneDeep, isNumber, isObject, isString } from 'utils/data'

// Core Data Model
import { CoreDataModel } from 'data-models/core'

// Types
import { MapLink } from 'types/map'

export type MapGraphData<AreaDatum, PointDatum, LinkDatum> = {
  areas?: AreaDatum[];
  points?: PointDatum[];
  links?: LinkDatum[];
}

export class MapGraphDataModel<AreaDatum, PointDatum, LinkDatum> extends CoreDataModel<MapGraphData<AreaDatum, PointDatum, LinkDatum>> {
  private _areas: AreaDatum[] = []
  private _points: PointDatum[] = []
  private _links: MapLink<PointDatum, LinkDatum>[] = []

  // Model configuration
  /* eslint-disable-next-line dot-notation */
  public pointId: ((n: PointDatum) => string) = n => n['id']
  /* eslint-disable-next-line dot-notation */
  public linkSource: ((l: LinkDatum) => number | string | PointDatum) = l => l['source']
  /* eslint-disable-next-line dot-notation */
  public linkTarget: ((l: LinkDatum) => number | string | PointDatum) = l => l['target']

  get data (): MapGraphData<AreaDatum, PointDatum, LinkDatum> {
    return this._data
  }

  set data (data: MapGraphData<AreaDatum, PointDatum, LinkDatum>) {
    if (!data) return
    this._data = data

    this._areas = cloneDeep(data?.areas ?? [])
    this._points = cloneDeep(data?.points ?? [])

    this._links = cloneDeep(data?.links ?? []).reduce((arr, link) => {
      const source = this.findPoint(this.points, this.linkSource(link))
      const target = this.findPoint(this.points, this.linkTarget(link))
      if (source && target) arr.push({ source, target })
      return arr
    }, [])
  }

  get areas (): AreaDatum[] {
    return this._areas
  }

  get points (): PointDatum[] {
    return this._points
  }

  get links (): MapLink<PointDatum, LinkDatum>[] {
    return this._links
  }

  private findPoint (points: PointDatum[], pointIdentifier: number | string | PointDatum): PointDatum | undefined {
    let foundPoint: PointDatum | undefined
    if (isNumber(pointIdentifier)) foundPoint = points[pointIdentifier as number]
    else if (isString(pointIdentifier)) foundPoint = points.find(node => this.pointId(node) === pointIdentifier)
    else if (isObject(pointIdentifier)) foundPoint = points.find(node => node === pointIdentifier)

    if (!foundPoint) {
      console.warn(`Point ${pointIdentifier} is missing from the points list`)
    }

    return foundPoint
  }
}
