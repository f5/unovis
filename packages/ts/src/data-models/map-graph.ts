// Utils
import { isNumber, isObject, isString } from 'utils/data'

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
  public pointId: ((n: PointDatum, i: number) => string) = n => (n as unknown as {id: string}).id
  public linkSource: ((l: LinkDatum) => number | string | PointDatum) = l => (l as unknown as {source: string}).source
  public linkTarget: ((l: LinkDatum) => number | string | PointDatum) = l => (l as unknown as {target: string}).target

  get data (): MapGraphData<AreaDatum, PointDatum, LinkDatum> {
    return this._data
  }

  set data (data: MapGraphData<AreaDatum, PointDatum, LinkDatum>) {
    if (!data) return
    this._data = data

    // Shallow-copy the input areas and points: the library augments them with top-level
    // properties, so the copies keep the user's objects intact while avoiding a deep clone
    // of the whole dataset. The links are only read here (new objects are built from them)
    this._areas = (data?.areas ?? []).map(a => ({ ...a }))
    this._points = (data?.points ?? []).map(p => ({ ...p }))

    this._links = (data?.links ?? []).reduce((arr, link) => {
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
    else if (isString(pointIdentifier)) foundPoint = points.find((node, i) => this.pointId(node, i) === pointIdentifier)
    else if (isObject(pointIdentifier)) foundPoint = points.find(node => node === pointIdentifier)

    if (!foundPoint) {
      console.warn(`Point ${pointIdentifier} is missing from the points list`)
    }

    return foundPoint
  }
}
