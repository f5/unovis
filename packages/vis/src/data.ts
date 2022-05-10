import worldMap from './data/world-simple.json'
import worldMapSimplest from './data/world-simplest.json'
import worldMap110mAlpha from './data/world-110m-alpha.json'

import unitedStates from './data/us-states.json'
import usCounties from './data/us-counties.json'
import china from './data/china-provinces.json'
import france from './data/fr-regions.json'
import germany from './data/germany-regions.json'
import india from './data/ind-regions.json'
import uk from './data/uk-regions.json'

export { TangramArcticDark, TangramArcticLight, MapLibreArcticDark, MapLibreArcticLight } from './components/leaflet-map/renderer/map-style'

export const WorldMapTopoJSON = worldMap as unknown as TopoJSON.Topology<{countries: TopoJSON.GeometryCollection<{name: string; color: string}>}>
export const WorldMap110mAlphaTopoJSON = worldMap110mAlpha as unknown as TopoJSON.Topology<{countries: TopoJSON.GeometryCollection<{name: string; color: string}>}>
export const WorldMapSimplestTopoJSON = worldMapSimplest as unknown as TopoJSON.Topology<{countries: TopoJSON.GeometryCollection<{name: string; color: string}>}>

export const USATopoJSON = unitedStates as unknown as TopoJSON.Topology<{states: TopoJSON.GeometryCollection<{name: string; color: string}>}>
export const USCountiesTopoJSON = usCounties as unknown as TopoJSON.Topology<{counties: TopoJSON.GeometryCollection<{name: string; color: string}>}>

export const GermanyTopoJSON = germany as unknown as TopoJSON.Topology<{regions: TopoJSON.GeometryCollection<{name: string; color: string}>}>
export const UKTopoJSONMap = uk as unknown as TopoJSON.Topology<{regions: TopoJSON.GeometryCollection<{name: string; color: string}>}>
export const FranceTopoJSONMap = france as unknown as TopoJSON.Topology<{regions: TopoJSON.GeometryCollection<{name: string; color: string}>}>
export const IndiaTopoJSONMap = india as unknown as TopoJSON.Topology<{regions: TopoJSON.GeometryCollection<{name: string; color: string}>}>
export const ChinaTopoJSONMap = china as unknown as TopoJSON.Topology<{provinces: TopoJSON.GeometryCollection<{name: string; color: string}>}>
