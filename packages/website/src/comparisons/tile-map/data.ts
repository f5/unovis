import { randomGenerator } from '../utils/random'
import { earthquakes } from './earthquakes'

export type MagnitudeClass = 'light' | 'moderate' | 'strong'

export type DataRecord = {
  id: string;
  longitude: number;
  latitude: number;
  magnitude: number;
  place: string;
}

export const magnitudeClasses: { key: MagnitudeClass; label: string }[] = [
  { key: 'light', label: 'M4.5–4.9' },
  { key: 'moderate', label: 'M5–5.9' },
  { key: 'strong', label: 'M6+' },
]

export const getMagnitudeClass = (d: DataRecord): MagnitudeClass => d.magnitude >= 6 ? 'strong' : d.magnitude >= 5 ? 'moderate' : 'light'
export const getRadius = (d: DataRecord): number => 3 + (d.magnitude - 4.5) * 4

// A random 70% of the magnitude 4.5+ earthquakes recorded by the USGS in one month
export function getData (seed: number): DataRecord[] {
  const random = randomGenerator(seed)
  return earthquakes
    .filter(() => random() < 0.7)
    .map(([id, longitude, latitude, magnitude, place]) => ({ id, longitude, latitude, magnitude, place }))
}
