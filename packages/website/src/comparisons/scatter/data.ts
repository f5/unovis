import { randomGenerator } from '../utils/random'
import { penguins } from './penguins'

export type DataRecord = {
  /** Position of the penguin in the dataset, so every penguin keeps its id between updates */
  id: string;
  species: string;
  billLength: number;
  flipperLength: number;
  bodyMass: number;
}

export const species = ['Adelie', 'Chinstrap', 'Gentoo']

export const formatMass = (grams: number): string => `${(grams / 1000).toFixed(1)} kg`

// A random half of the 342 penguins from the Palmer Archipelago dataset
export function getData (seed: number): DataRecord[] {
  const random = randomGenerator(seed)
  return penguins
    .map(([species, billLength, flipperLength, bodyMass], i) => ({ id: `${i}`, species, billLength, flipperLength, bodyMass }))
    .filter(() => random() < 0.5)
}
