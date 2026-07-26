export default [
  {
    name: 'stacked-time',
    input: {
      title: 'Renewable Energy Generation',
      data: Array.from({ length: 12 }, (_, i) => ({
        month: `2024-${String(i + 1).padStart(2, '0')}`,
        solar: Math.round(30 + Math.sin(i / 2 - 1.4) * 22 + i),
        wind: Math.round(52 + Math.cos(i / 2.5) * 15),
        hydro: Math.round(38 - Math.sin(i / 3) * 8),
      })),
      x: 'month',
      xIsTime: true,
      y: ['solar', 'wind', 'hydro'],
      seriesLabels: ['Solar', 'Wind', 'Hydro'],
      yAxisLabel: 'TWh',
    },
  },
  {
    name: 'overlapping',
    input: {
      title: 'Daily Active Users by Platform',
      data: Array.from({ length: 24 }, (_, i) => ({
        week: i + 1,
        ios: Math.round(140 + Math.sin(i / 3) * 45 + i * 6),
        android: Math.round(230 + Math.cos(i / 4) * 35 + i * 3),
      })),
      x: 'week',
      y: ['ios', 'android'],
      stacked: false,
      curve: 'basis',
      seriesLabels: ['iOS', 'Android'],
      xAxisLabel: 'Week',
      yAxisLabel: 'Users (thousands)',
    },
  },
  {
    name: 'single-category',
    input: {
      data: [
        { stage: 'Visited', count: 8200 }, { stage: 'Signed up', count: 3400 },
        { stage: 'Activated', count: 2100 }, { stage: 'Subscribed', count: 940 },
        { stage: 'Renewed', count: 610 },
      ],
      x: 'stage',
      y: 'count',
      curve: 'monotoneX',
      colors: ['#00C19A'],
      yAxisLabel: 'Users',
      height: 360,
    },
  },
]
