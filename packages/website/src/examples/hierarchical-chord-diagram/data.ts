export type NodeDatum = {
  id: string;
  country: string;
}

export type LinkDatum = {
  source: NodeDatum;
  target: NodeDatum;
  value: number;
}

const names = ['Apple', 'HTC', 'Huawei', 'LG', 'Nokia', 'Samsung', 'Sony', 'Other']
const countries = ['US', 'Taiwan', 'China', 'South Korea', 'Finland', 'South Korea', 'Japan', 'unknown']
const colors = [
  '#4D8CFD',
  '#FF6B7E',
  '#F4B83E',
  '#A6CC74',
  '#00C19A',
  '#6859BE',
  '#b6128c',
  '#737373',
]

const values = [
  [0.096899, 0.008859, 0.000554, 0.004430, 0.025471, 0.024363, 0.005537, 0.025471],
  [0.001107, 0.018272, 0.000000, 0.004983, 0.011074, 0.010520, 0.002215, 0.004983],
  [0.000554, 0.002769, 0.002215, 0.002215, 0.003876, 0.008306, 0.000554, 0.003322],
  [0.000554, 0.001107, 0.000554, 0.012182, 0.011628, 0.006645, 0.004983, 0.010520],
  [0.002215, 0.004430, 0.000000, 0.002769, 0.104097, 0.012182, 0.004983, 0.028239],
  [0.011628, 0.026024, 0.000000, 0.013843, 0.087486, 0.168328, 0.017165, 0.055925],
  [0.000554, 0.004983, 0.000000, 0.003322, 0.004430, 0.008859, 0.017719, 0.004430],
  [0.002215, 0.007198, 0.000000, 0.003322, 0.016611, 0.014950, 0.001107, 0.054264],
]

export const nodes = Array.from(names, (name, i) => ({ id: name, country: countries[i] }))
export const links = values.flatMap((arr, i) => arr.map((value, j) => ({ source: nodes[i], target: nodes[j], value })))
export const colorMap: Map<string, string> = countries.reduce((acc, curr) => {
  if (!acc.has(curr)) acc.set(curr, colors[acc.size])
  return acc
}, new Map<string, string>())
