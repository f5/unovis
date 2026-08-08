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

type RegionFeature = { name: string; color: string }
type Topo<K extends string> = TopoJSON.Topology<Record<K, TopoJSON.GeometryCollection<RegionFeature>>>

const topo = <T>(json: unknown): T => json as T

export const WorldMapTopoJSON = topo<Topo<'countries'>>(worldMap)
export const WorldMap110mAlphaTopoJSON = topo<Topo<'countries'>>(worldMap110mAlpha)
export const WorldMapSimplestTopoJSON = topo<Topo<'countries'>>(worldMapSimplest)

export const USATopoJSON = topo<Topo<'states'>>(unitedStates)
export const USCountiesTopoJSON = topo<Topo<'counties'>>(usCounties)

export const GermanyTopoJSON = topo<Topo<'regions'>>(germany)
export const UKTopoJSON = topo<Topo<'regions'>>(uk)
export const FranceTopoJSON = topo<Topo<'regions'>>(france)
export const IndiaTopoJSON = topo<Topo<'regions'>>(india)
export const ChinaTopoJSON = topo<Topo<'provinces'>>(china)
