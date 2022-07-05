import areas from './areas.json'
import cities from './cities.json'
import citiesBig from './cities_big.json'

import { sample } from '../../utils/data'

type MapPoint = {
  id: string;
  latitude: number;
  longitude: number;
  city: string;
  cursor: string;
}

type MapArea = {
  id: string;
  name: string;
  color: string;
  cursor: string;
}

type MapLink = {
  source: string;
  target: number;
  width: number;
  cursor: string;
}

export const data = {
  points: cities as MapPoint[],
  areas: areas.slice(0, 30).map(a => ({
    id: a.ISO,
    name: a.Country,
    color: '#ef8f73',
    cursor: 'pointer',
  })) as MapArea[],
  links: Array(10).fill(0).map(i => ({
    source: sample(cities).id,
    target: sample(cities).id,
    width: Math.floor(Math.random() * 5) + 1,
    cursor: 'crosshair',
  })) as MapLink[],
}

export const pointData = {
  points: Array(25).fill(0).map(() => sample(citiesBig)),
}

export const heatmapData = {
  points: citiesBig.map(d => ({
    ...d,
    color: sample(['#0065ff', '#4b73ff', '#6b81ff', '#838fff', '#999eff', '#acadff', '#bebdff', '#cfcdff', '#dfddff']),
  })),
}
