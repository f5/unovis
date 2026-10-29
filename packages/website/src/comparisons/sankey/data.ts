import { randomGenerator, randomBetween } from '../utils/random'

export type NodeDatum = {
  id: string;
  label: string;
}

export type LinkDatum = {
  source: string;
  target: string;
  value: number;
}

export type SankeyData = {
  nodes: NodeDatum[];
  links: LinkDatum[];
}

const sources: NodeDatum[] = [
  { id: 'search', label: 'Search' },
  { id: 'ads', label: 'Ads' },
  { id: 'social', label: 'Social' },
  { id: 'newsletter', label: 'Newsletter' },
  { id: 'direct', label: 'Direct' },
]

const pages: NodeDatum[] = [
  { id: 'home', label: 'Home page' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'blog', label: 'Blog' },
  { id: 'tour', label: 'Product tour' },
]

const outcomes: NodeDatum[] = [
  { id: 'signup', label: 'Signed up' },
  { id: 'demo', label: 'Booked a demo' },
  { id: 'left', label: 'Left' },
]

export const formatVisits = (visits: number): string => `${visits.toLocaleString('en-US')} visits`

// One month of website visits: where visitors came from, where they landed and what they did next
export function getData (seed: number): SankeyData {
  const random = randomGenerator(seed)
  const links: LinkDatum[] = []

  sources.forEach(source => pages.forEach(page => {
    if (source.id === 'search' || random() < 0.7) {
      links.push({ source: source.id, target: page.id, value: Math.round(randomBetween(random, 200, 3000)) })
    }
  }))

  pages.forEach(page => {
    const visits = links.filter(l => l.target === page.id).reduce((sum, l) => sum + l.value, 0)
    const signups = Math.round(visits * randomBetween(random, 0.05, 0.25))
    const demos = Math.round(visits * randomBetween(random, 0.02, 0.1))
    links.push(
      { source: page.id, target: 'signup', value: signups },
      { source: page.id, target: 'demo', value: demos },
      { source: page.id, target: 'left', value: visits - signups - demos }
    )
  })

  return { nodes: [...sources, ...pages, ...outcomes], links }
}
