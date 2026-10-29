import { randomGenerator, randomBetween } from '../utils/random'

export type NodeDatum = {
  id: string;
  label: string;
  continent: string;
}

export type LinkDatum = {
  source: string;
  target: string;
  value: number;
}

export type ChordData = {
  nodes: NodeDatum[];
  links: LinkDatum[];
}

export const continents = ['Americas', 'Europe', 'Asia Pacific']

export const regions: NodeDatum[] = [
  { id: 'us-east-1', label: 'N. Virginia', continent: 'Americas' },
  { id: 'us-west-2', label: 'Oregon', continent: 'Americas' },
  { id: 'eu-west-1', label: 'Ireland', continent: 'Europe' },
  { id: 'eu-central-1', label: 'Frankfurt', continent: 'Europe' },
  { id: 'ap-southeast-1', label: 'Singapore', continent: 'Asia Pacific' },
  { id: 'ap-northeast-1', label: 'Tokyo', continent: 'Asia Pacific' },
]

export const formatTraffic = (terabytes: number): string => `${terabytes} TB`

// One month of data transfer between the cloud regions of a SaaS product, in terabytes, both directions combined
export function getData (seed: number): ChordData {
  const random = randomGenerator(seed)
  const links: LinkDatum[] = []

  regions.forEach((source, i) => regions.slice(i + 1).forEach(target => {
    const sameContinent = source.continent === target.continent
    // Every region replicates to N. Virginia, the primary region; the other pairs talk to each other most months
    if (sameContinent || source.id === 'us-east-1' || random() < 0.7) {
      const value = Math.round(sameContinent ? randomBetween(random, 40, 120) : randomBetween(random, 5, 50))
      links.push({ source: source.id, target: target.id, value })
    }
  }))

  return { nodes: regions, links }
}
