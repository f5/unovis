export default [
  {
    name: 'multi-series-time',
    input: {
      title: 'Website Traffic',
      data: Array.from({ length: 30 }, (_, i) => ({
        date: `2024-03-${String(i + 1).padStart(2, '0')}`,
        visits: Math.round(1200 + Math.sin(i / 4) * 400 + i * 25),
        signups: Math.round(90 + Math.cos(i / 5) * 30 + i * 3),
      })),
      x: 'date',
      xIsTime: true,
      y: ['visits', 'signups'],
      seriesLabels: ['Visits', 'Signups'],
      yAxisLabel: 'Count per day',
    },
  },
  {
    name: 'reference-decorations',
    input: {
      title: 'API Latency vs SLA',
      data: Array.from({ length: 24 }, (_, i) => ({
        t: i,
        ms: Math.round(120 + Math.sin(i / 2.5) * 60 + i * 4),
      })),
      x: 't',
      y: 'ms',
      xAxisLabel: 'Hour',
      yAxisLabel: 'p95 latency (ms)',
      referenceLines: [{ axis: 'y', value: 200, label: 'SLA', color: '#FF6B7E', style: 'dashed', lineWidth: 1.5 }],
      referenceBands: [{ axis: 'y', from: 0, to: 150, label: 'healthy', color: '#00C19A' }],
    },
  },
  {
    name: 'single-series-gaps',
    input: {
      data: Array.from({ length: 20 }, (_, i) => ({
        x: i,
        y: i > 7 && i < 11 ? null : Math.round(50 + Math.sin(i / 2) * 30),
      })),
      x: 'x',
      y: 'y',
      interpolateMissing: true,
      curve: 'linear',
      xAxisLabel: 'Step',
      yAxisLabel: 'Value',
    },
  },
]
