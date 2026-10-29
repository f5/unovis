// Shared by every entry file, so data and series definitions are byte-identical in every bundle.
// Colors are passed explicitly to every library: tree-shaken Chart.js has no default palette and
// Recharts draws every <Line> in the same default color, so this keeps the charts equivalent.

export const SERIES = [
  { key: 'a', label: 'Series A', color: '#4e79a7' },
  { key: 'b', label: 'Series B', color: '#f28e2b' },
  { key: 'c', label: 'Series C', color: '#59a14f' },
]

export const DATA = Array.from({ length: 24 }, (_, i) => ({
  x: i,
  a: Math.round(50 + 30 * Math.sin(i / 3)),
  b: Math.round(40 + 20 * Math.cos(i / 4)),
  c: Math.round(20 + 2 * i),
}))

export const getContainer = () => document.getElementById('app')
