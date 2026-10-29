import { randomGenerator } from '../utils/random'

export type DataRecord = {
  endpoint: string;
  /** Response times of the sampled requests, in milliseconds */
  samples: number[];
}

/** The five numbers of a box, plus the samples beyond the whiskers */
export type BoxStats = {
  endpoint: string;
  low: number;
  q1: number;
  median: number;
  q3: number;
  high: number;
  outliers: number[];
}

/** `tukey`: the whiskers end at the last samples within 1.5 × IQR of the box, the rest are outliers; `min-max`: at the extremes */
export type WhiskerMode = 'tukey' | 'min-max'

const endpoints = [
  { endpoint: 'GET /health', typical: 40 },
  { endpoint: 'GET /users', typical: 90 },
  { endpoint: 'POST /login', typical: 150 },
  { endpoint: 'GET /search', typical: 210 },
  { endpoint: 'POST /orders', typical: 260 },
  { endpoint: 'POST /upload', typical: 400 },
]

const SAMPLES_PER_ENDPOINT = 40

export const formatMs = (value: number): string => `${Math.round(value).toLocaleString('en-US')} ms`

// Linearly interpolated quantile of sorted values (R-7), the method d3, Vega, Observable Plot, ECharts and the
// Chart.js box plot plugin use
export function quantile (sorted: number[], p: number): number {
  const h = (sorted.length - 1) * p
  const i = Math.floor(h)
  return i + 1 < sorted.length ? sorted[i] + (sorted[i + 1] - sorted[i]) * (h - i) : sorted[i]
}

// Box statistics for the libraries that take them precomputed
export function getBoxStats (d: DataRecord, whiskers: WhiskerMode = 'tukey'): BoxStats {
  const sorted = d.samples.slice().sort((a, b) => a - b)
  const q1 = quantile(sorted, 0.25)
  const q3 = quantile(sorted, 0.75)
  const fence = whiskers === 'tukey' ? 1.5 * (q3 - q1) : Infinity
  const inside = sorted.filter(v => v >= q1 - fence && v <= q3 + fence)
  return {
    endpoint: d.endpoint,
    low: inside[0],
    q1,
    median: quantile(sorted, 0.5),
    q3,
    high: inside[inside.length - 1],
    outliers: sorted.filter(v => v < q1 - fence || v > q3 + fence),
  }
}

// Response times of 40 sampled requests to each of the API's busiest endpoints over the last hour, in milliseconds.
// Latencies are log-normal: most requests are fast and a long tail is slow.
export function getData (seed: number): DataRecord[] {
  const random = randomGenerator(seed)
  const gaussian = (): number => Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random())
  return endpoints.map(({ endpoint, typical }) => {
    const spread = 0.25 + 0.2 * random()
    return {
      endpoint,
      samples: Array.from({ length: SAMPLES_PER_ENDPOINT }, () => Math.round(typical * Math.exp(spread * gaussian()))),
    }
  })
}
