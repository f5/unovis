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
