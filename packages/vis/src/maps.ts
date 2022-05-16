import worldMap from './maps/world-simple.json'
import worldMapSimplest from './maps/world-simplest.json'
import worldMap110mAlpha from './maps/world-110m-alpha.json'

import unitedStates from './maps/us-states.json'
import usCounties from './maps/us-counties.json'
import china from './maps/china-provinces.json'
import france from './maps/fr-regions.json'
import germany from './maps/germany-regions.json'
import india from './maps/ind-regions.json'
import uk from './maps/uk-regions.json'

export const WorldMapTopoJSON = worldMap as unknown as TopoJSON.Topology<{countries: TopoJSON.GeometryCollection<{name: string; color: string}>}>
export const WorldMap110mAlphaTopoJSON = worldMap110mAlpha as unknown as TopoJSON.Topology<{countries: TopoJSON.GeometryCollection<{name: string; color: string}>}>
export const WorldMapSimplestTopoJSON = worldMapSimplest as unknown as TopoJSON.Topology<{countries: TopoJSON.GeometryCollection<{name: string; color: string}>}>

export const USATopoJSON = unitedStates as unknown as TopoJSON.Topology<{states: TopoJSON.GeometryCollection<{name: string; color: string}>}>
export const USCountiesTopoJSON = usCounties as unknown as TopoJSON.Topology<{counties: TopoJSON.GeometryCollection<{name: string; color: string}>}>

export const GermanyTopoJSON = germany as unknown as TopoJSON.Topology<{regions: TopoJSON.GeometryCollection<{name: string; color: string}>}>
export const UKTopoJSON = uk as unknown as TopoJSON.Topology<{regions: TopoJSON.GeometryCollection<{name: string; color: string}>}>
export const FranceTopoJSON = france as unknown as TopoJSON.Topology<{regions: TopoJSON.GeometryCollection<{name: string; color: string}>}>
export const IndiaTopoJSON = india as unknown as TopoJSON.Topology<{regions: TopoJSON.GeometryCollection<{name: string; color: string}>}>
export const ChinaTopoJSON = china as unknown as TopoJSON.Topology<{provinces: TopoJSON.GeometryCollection<{name: string; color: string}>}>
