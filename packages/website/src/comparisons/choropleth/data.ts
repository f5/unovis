import { feature } from 'topojson-client'
import { WorldMapTopoJSON } from '@unovis/ts/maps'

import { randomGenerator, randomBetween, round } from '../utils/random'

export type AreaDatum = {
  /** ISO 3166-1 alpha-2 code, the id of the country on the map */
  id: string;
  name: string;
  /** Monthly active users, in millions */
  users: number;
}

export type PointDatum = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export type LinkDatum = {
  source: string;
  target: string;
  /** Traffic between two data centers, in Gbit/s */
  traffic: number;
}

export type ChoroplethData = {
  areas: AreaDatum[];
  points: PointDatum[];
  links: LinkDatum[];
}

export const usersDomain: [number, number] = [0, 50]
export const formatUsers = (users: number): string => `${round(users)}M users`
export const formatTraffic = (traffic: number): string => `${traffic} Gbit/s`
// For the "Traffic bubbles" preset: the traffic through a data center, and its bubble's radius in pixels
export const getTraffic = (links: LinkDatum[], id: string): number => links.reduce((sum, l) => l.source === id || l.target === id ? sum + l.traffic : sum, 0)
export const trafficRadius = (traffic: number): number => Math.sqrt(traffic) / 2

// The same country shapes for every library: Unovis reads the TopoJSON, the others take GeoJSON features.
// Four shapes, such as Somaliland, have no country code, so their GeoJSON id is their name
export const worldMap = WorldMapTopoJSON
export const countries = feature(worldMap, worldMap.objects.countries).features.map(f => ({ ...f, id: f.id || f.properties.name }))

const dataCenters: PointDatum[] = [
  { id: 'sfo', name: 'San Francisco', latitude: 37.77, longitude: -122.42 },
  { id: 'nyc', name: 'New York', latitude: 40.71, longitude: -74.01 },
  { id: 'sao', name: 'São Paulo', latitude: -23.55, longitude: -46.63 },
  { id: 'lon', name: 'London', latitude: 51.51, longitude: -0.13 },
  { id: 'fra', name: 'Frankfurt', latitude: 50.11, longitude: 8.68 },
  { id: 'jnb', name: 'Johannesburg', latitude: -26.2, longitude: 28.05 },
  { id: 'bom', name: 'Mumbai', latitude: 19.08, longitude: 72.88 },
  { id: 'sin', name: 'Singapore', latitude: 1.35, longitude: 103.82 },
  { id: 'tyo', name: 'Tokyo', latitude: 35.68, longitude: 139.69 },
  { id: 'syd', name: 'Sydney', latitude: -33.87, longitude: 151.21 },
]

const connections: [string, string][] = [
  ['sfo', 'nyc'], ['nyc', 'lon'], ['lon', 'fra'], ['nyc', 'sao'], ['fra', 'jnb'], ['fra', 'bom'],
  ['bom', 'sin'], ['sin', 'tyo'], ['sin', 'syd'], ['sfo', 'tyo'], ['sfo', 'syd'], ['sao', 'jnb'],
]

// Monthly active users of a web service by country, its data centers and the traffic between them
export function getData (seed: number): ChoroplethData {
  const random = randomGenerator(seed)
  const areas = worldMap.objects.countries.geometries
    .filter(g => g.id)
    .map(g => ({ id: `${g.id}`, name: g.properties.name, users: round(random() ** 2 * usersDomain[1]) }))
  const links = connections.map(([source, target]) => ({ source, target, traffic: Math.round(randomBetween(random, 20, 400)) }))

  return { areas, points: dataCenters, links }
}
