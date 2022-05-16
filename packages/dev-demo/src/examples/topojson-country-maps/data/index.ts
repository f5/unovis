import { MapData, MapProjection, TopoJSONMapConfigInterface, Scale } from '@volterra/vis'
import { ChinaTopoJSON, FranceTopoJSON, GermanyTopoJSON, IndiaTopoJSON, UKTopoJSON, USATopoJSON } from '@volterra/vis/maps'


export type Area = { id: string; color: string }

export type Country = {
  id: string;
  config: TopoJSONMapConfigInterface<Area>;
  data?: MapData<Area>;
}

const colorScale = Scale.scaleLinear<string>().domain([0, 1]).range(['#BFD8FF', '#0065FF'])

function generateAreaData (topo: TopoJSON.Topology, feat = 'regions'): Area[] {
  const geoIds = (topo.objects[feat] as TopoJSON.GeometryCollection<Area>).geometries
  return geoIds.map(a => ({ id: a.id as string, color: colorScale(Math.random()) }))
}

export const maps: Country[] = [
  {
    id: 'US',
    config: {
      topojson: USATopoJSON,
      mapFeatureName: 'states',
      projection: MapProjection.AlbersUsa(),
    },
    data: {
      areas: generateAreaData(USATopoJSON, 'states'),
    },
  }, {
    id: 'FR',
    config: {
      topojson: FranceTopoJSON,
      mapFeatureName: 'regions',
    },
    data: {
      areas: generateAreaData(FranceTopoJSON),
    },
  },
  {
    id: 'IN',
    config: {
      topojson: IndiaTopoJSON,
      mapFeatureName: 'regions',
    },
    data: {
      areas: generateAreaData(IndiaTopoJSON),
    },
  },
  {
    id: 'DE',
    config: {
      topojson: GermanyTopoJSON,
      mapFeatureName: 'regions',
    },
    data: {
      areas: generateAreaData(GermanyTopoJSON),
    },
  },
  {
    id: 'CN',
    config: {
      topojson: ChinaTopoJSON,
      mapFeatureName: 'provinces',
    },
    data: {
      areas: generateAreaData(ChinaTopoJSON, 'provinces'),
    },
  },
  {
    id: 'GB',
    config: {
      topojson: UKTopoJSON,
      mapFeatureName: 'regions',
    },
    data: {
      areas: generateAreaData(UKTopoJSON),
    },
  },
]


