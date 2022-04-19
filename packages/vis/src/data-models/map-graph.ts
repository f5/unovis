// Utils
import { cloneDeep, isNumber, isObject, isString } from 'utils/data'

// Core Data Model
import { CoreDataModel } from 'data-models/core'

// Types
import { MapLink } from 'types/map'

export class MapGraphDataModel<AreaDatum, PointDatum, LinkDatum> extends CoreDataModel<{ areas?: AreaDatum[]; points?: PointDatum[]; links?: LinkDatum[] }> {
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

  // eslint-disable-next-line accessor-pairs
  set data (data: { areas?: AreaDatum[]; points?: PointDatum[]; links?: LinkDatum[] }) {
    if (!data) return

    this._areas = cloneDeep(data?.areas ?? [])
    this._points = cloneDeep(data?.points ?? [])
    const links: MapLink<PointDatum, LinkDatum>[] = cloneDeep(data?.links ?? [])

    // Fill link source and target
    links.forEach((link) => {
      link.source = this.findPoint(this.points, this.linkSource(link))
      link.target = this.findPoint(this.points, this.linkTarget(link))
    })

    this._links = links.filter(l => l.source && l.target)
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
