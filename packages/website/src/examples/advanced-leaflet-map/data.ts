/* eslint-disable @typescript-eslint/naming-convention */
import { MapLibreStyleSpecs } from '@unovis/ts'

export type MapPointDataRecord = {
  name: string;
  longitude: number;
  latitude: number;
  normal: number;
  blocked: number;
}

export const data: MapPointDataRecord[] = [
  { latitude: 52.35598, longitude: 4.95035, name: 'ams9', normal: 948, blocked: 4 },
  { latitude: 33.64989, longitude: 130.12389, name: 'ap-0', normal: 980, blocked: 5 },
  { latitude: 35.66822, longitude: 139.67082, name: 'ap-1', normal: 105, blocked: 0 },
  { latitude: 34.67764, longitude: 135.45105, name: 'ap-2', normal: 783, blocked: 7 },
  { latitude: 22.16182, longitude: 113.53505, name: 'ap-3', normal: 361, blocked: 82 },
  { latitude: 37.56508, longitude: 126.91934, name: 'ap-4', normal: 446, blocked: 5 },
  { latitude: 38.31359, longitude: 140.69612, name: 'ap-5', normal: 220, blocked: 6 },
  { latitude: 51.50986, longitude: -0.118092, name: 'astral-azure', normal: 878, blocked: 4 },
  { latitude: 1.35208, longitude: 103.81984, name: 'astral-gcp', normal: 716, blocked: 1 },
  { latitude: 37.49858, longitude: -122.29465, name: 'corp-branch-1', normal: 143, blocked: 8 },
  { latitude: 48.90162, longitude: 2.4153903, name: 'dc-eu-west', normal: 684, blocked: 0 },
  { latitude: 40.74135, longitude: -74.005394, name: 'dc-us-east', normal: 874, blocked: 2 },
  { latitude: 37.44582, longitude: -122.163, name: 'dc-us-west', normal: 974, blocked: 8 },
  { latitude: 51.52857, longitude: -0.2420208, name: 'eu-0', normal: 24289, blocked: 6672 },
  { latitude: 48.85883, longitude: 2.2768495, name: 'eu-1', normal: 554, blocked: 155 },
  { latitude: 38.74362, longitude: -9.195309, name: 'eu-2', normal: 841, blocked: 655 },
  { latitude: 50.12119, longitude: 8.566354, name: 'eu-3', normal: 452, blocked: 0 },
  { latitude: 40.43793, longitude: -3.749747, name: 'eu-4', normal: 343, blocked: 0 },
  { latitude: 41.91005, longitude: 12.465787, name: 'eu-5', normal: 444, blocked: 222 },
  { latitude: 50.05958, longitude: 14.325202, name: 'eu-6', normal: 287, blocked: 5 },
  { latitude: 40.71772, longitude: -74.0083, name: 'nyc', normal: 41, blocked: 8 },
  { latitude: 48.92716, longitude: 2.350664, name: 'par', normal: 498, blocked: 4 },
  { latitude: 48.90105, longitude: 2.423093, name: 'par-2', normal: 626, blocked: 0 },
  { latitude: 1.29594, longitude: 103.788376, name: 'sin', normal: 992, blocked: 0 },
  { latitude: 37.24117, longitude: -121.77938, name: 'sjc', normal: 637, blocked: 3 },
  { latitude: 51.51139, longitude: -0.001787, name: 'lon', normal: 979, blocked: 6 },
  { latitude: 35.62267, longitude: 139.77003, name: 'tky', normal: 174, blocked: 6 },
  { latitude: 40.72916, longitude: -74.00558, name: 'usa-0', normal: 631, blocked: 1 },
  { latitude: 38.90632, longitude: -77.04191, name: 'usa-1', normal: 21, blocked: 0 },
  { latitude: 25.79083, longitude: -80.14021, name: 'usa-2', normal: 487, blocked: 0 },
  { latitude: 30.00407, longitude: -90.15977, name: 'usa-3', normal: 751, blocked: 3 },
  { latitude: 41.89261, longitude: -87.62556, name: 'usa-4', normal: 764, blocked: 3 },
  { latitude: 32.78868, longitude: -97.34767, name: 'usa-5', normal: 0, blocked: 530 },
  { latitude: 36.10304, longitude: -115.17369, name: 'usa-6', normal: 609, blocked: 5 },
  { latitude: 34.10182, longitude: -118.32421, name: 'usa-7', normal: 543, blocked: 0 },
  { latitude: 37.44428, longitude: -122.17108, name: 'usa-8', normal: 1920, blocked: 0 },
  { latitude: 47.61698, longitude: -122.33839, name: 'usa-9', normal: 513, blocked: 2 },
]

export const totalEvents = data.reduce((sum, d) => sum + d.normal, 0) / data.length

export const generateStyle = (
  backgroundColor: string,
  countryFillColor: string,
  countryBoundaryColor: string,
  coastlineColor: string
): MapLibreStyleSpecs => ({
  name: 'MapLibre-Unovis',
  sources: {
    maplibre: {
      url: 'https://demotiles.maplibre.org/tiles/tiles.json',
      type: 'vector',
    },
  },
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  layers: [{
    id: 'background',
    type: 'background',
    paint: {
      'background-color': backgroundColor,
    },
    // filter: ['all'],
    layout: {
      visibility: 'visible',
    },
    maxzoom: 24,
  },
  {
    id: 'coastline',
    type: 'line',
    paint: {
      'line-blur': 0.5,
      'line-color': coastlineColor,
      'line-width': {
        type: 'interval',
        stops: [
          [0, 2],
          [6, 6],
          [14, 9],
          [22, 18],
        ],
      },
    },
    filter: ['all'],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
      visibility: 'visible',
    },
    source: 'maplibre',
    maxzoom: 24,
    minzoom: 0,
    'source-layer': 'countries',
  },
  {
    id: 'countries-fill',
    type: 'fill',
    paint: {
      'fill-color': countryFillColor,
    },
    filter: ['all'],
    layout: {
      visibility: 'visible',
    },
    source: 'maplibre',
    maxzoom: 24,
    'source-layer': 'countries',
  },
  {
    id: 'countries-boundary',
    type: 'line',
    paint: {
      'line-color': countryBoundaryColor,
      'line-width': {
        type: 'interval',
        stops: [[1, 1], [6, 2], [14, 6],
          [22, 12],
        ],
      },
      'line-opacity': {
        type: 'interval',
        stops: [
          [3, 0.5],
          [6, 1],
        ],
      },
    },
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
      visibility: 'visible',
    },
    source: 'maplibre',
    maxzoom: 24,
    'source-layer': 'countries',
  },
  {
    id: 'countries-label',
    type: 'symbol',
    paint: {
      'text-color': 'rgba(177, 177, 177, 1)',
      'text-halo-blur': {
        type: 'interval',
        stops: [
          [2, 0.2],
          [6, 0],
        ],
      },
      'text-halo-color': 'rgba(255, 255, 255, 1)',
      'text-halo-width': {
        type: 'interval',
        stops: [
          [2, 1],
          [6, 1.6],
        ],
      },
    },
    filter: ['all'],
    layout: {
      'text-font': [
        'Open Sans Semibold',
      ],
      'text-size': {
        type: 'interval',
        stops: [
          [2, 10],
          [4, 12],
          [6, 16],
        ],
      },
      'text-field': {
        type: 'interval',
        stops: [
          [4, '{NAME}'],
        ],
      },
      visibility: 'visible',
      'text-max-width': 10,
      'text-transform': {
        type: 'interval',
        stops: [
          [0, 'uppercase'],
          [2, 'none'],
        ],
      },
    },
    source: 'maplibre',
    maxzoom: 24,
    minzoom: 2,
    'source-layer': 'centroids',
  },
  ],
  bearing: 0,
  version: 8,
  metadata: {
    'maptiler:copyright': 'This style was generated on MapTiler Cloud.',
    'openmaptiles:version': '3.x',
  },
})

export const mapStyleLight = generateStyle('#DFE5EB', '#FEFEFE', '#DFE5EB', '#D3D8DE')

export const mapStyleDark = generateStyle('#292b34', '#5b5f6d', '#2a2a2a', '#2a2a2a')
