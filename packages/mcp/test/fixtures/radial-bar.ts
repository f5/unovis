export default [
  {
    name: 'daily-goals',
    input: {
      title: 'Daily Goals',
      data: [
        { metric: 'Move', pct: 84 },
        { metric: 'Exercise', pct: 62 },
        { metric: 'Stand', pct: 96 },
      ],
      value: 'pct',
      label: 'metric',
      maxValue: 100,
      arcWidth: 22,
      arcPadding: 6,
      centralLabel: '81%',
      centralSubLabel: 'overall',
      width: 480,
      height: 440,
    },
  },
  {
    name: 'quarterly-revenue',
    input: {
      data: [
        { quarter: 'Q1', revenue: 3.1 },
        { quarter: 'Q2', revenue: 4.6 },
        { quarter: 'Q3', revenue: 5.4 },
        { quarter: 'Q4', revenue: 7.2 },
      ],
      value: 'revenue',
      label: 'quarter',
      cornerRadius: 0,
      showBackground: false,
      height: 420,
    },
  },
]
