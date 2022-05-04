import _times from 'lodash/times'
import _sampleSize from 'lodash/sampleSize'
import _sample from 'lodash/sample'
import _random from 'lodash/random'

import areas from './areas.json'
import cities from './cities.json'
import citiesBig from './cities_big.json'


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
  links: _times(10).map(i => ({
    source: _sample(cities).id,
    target: _sample(cities).id,
    width: _random(1, 5),
    cursor: 'crosshair',
  })) as MapLink[],
}

export const pointData = {
  points: _sampleSize(citiesBig, 25),
}

export const heatmapData = {
  points: citiesBig.map(d => ({
    ...d,
    color: _sample(['#0065ff', '#4b73ff', '#6b81ff', '#838fff', '#999eff', '#acadff', '#bebdff', '#cfcdff', '#dfddff']),
  })),
}
