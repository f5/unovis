import {
  MapData,
  MapProjection,
  ChinaTopoJSONMap,
  FranceTopoJSONMap,
  GermanyTopoJSON,
  IndiaTopoJSONMap,
  UKTopoJSONMap,
  USATopoJSON,
  TopoJSONMapConfigInterface,
  Scale,
} from '@volterra/vis'

export type Area = { id: string; color: string }

export type Country = {
  id: string;
  config: TopoJSONMapConfigInterface<undefined, undefined, Area>;
  data?: MapData;
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
      topojson: FranceTopoJSONMap,
      mapFeatureName: 'regions',
    },
    data: {
      areas: generateAreaData(FranceTopoJSONMap),
    },
  },
  {
    id: 'IN',
    config: {
      topojson: IndiaTopoJSONMap,
      mapFeatureName: 'regions',
    },
    data: {
      areas: generateAreaData(IndiaTopoJSONMap),
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
      topojson: ChinaTopoJSONMap,
      mapFeatureName: 'provinces',
    },
    data: {
      areas: generateAreaData(ChinaTopoJSONMap, 'provinces'),
    },
  },
  {
    id: 'GB',
    config: {
      topojson: UKTopoJSONMap,
      mapFeatureName: 'regions',
    },
    data: {
      areas: generateAreaData(UKTopoJSONMap),
    },
  },
]


