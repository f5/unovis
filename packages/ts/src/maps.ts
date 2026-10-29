import type { Topology, GeometryCollection } from 'topojson-specification'

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

export const WorldMapTopoJSON = worldMap as unknown as
  Topology<{countries: GeometryCollection<{name: string; color: string}>}>
export const WorldMap110mAlphaTopoJSON = worldMap110mAlpha as unknown as
  Topology<{countries: GeometryCollection<{name: string; color: string}>}>
export const WorldMapSimplestTopoJSON = worldMapSimplest as unknown as
  Topology<{countries: GeometryCollection<{name: string; color: string}>}>

export const USATopoJSON = unitedStates as unknown as
  Topology<{states: GeometryCollection<{name: string; color: string}>}>
export const USCountiesTopoJSON = usCounties as unknown as
  Topology<{counties: GeometryCollection<{name: string; color: string}>}>

export const GermanyTopoJSON = germany as unknown as
  Topology<{regions: GeometryCollection<{name: string; color: string}>}>
export const UKTopoJSON = uk as unknown as
  Topology<{regions: GeometryCollection<{name: string; color: string}>}>
export const FranceTopoJSON = france as unknown as
  Topology<{regions: GeometryCollection<{name: string; color: string}>}>
export const IndiaTopoJSON = india as unknown as
  Topology<{regions: GeometryCollection<{name: string; color: string}>}>
export const ChinaTopoJSON = china as unknown as
  Topology<{provinces: GeometryCollection<{name: string; color: string}>}>
