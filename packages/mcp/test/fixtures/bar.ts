export default [
  {
    name: 'grouped-vertical',
    input: {
      title: 'Quarterly Revenue by Product',
      data: [
        { quarter: 'Q1', alpha: 42, beta: 28, gamma: 15 },
        { quarter: 'Q2', alpha: 48, beta: 34, gamma: 19 },
        { quarter: 'Q3', alpha: 45, beta: 41, gamma: 26 },
        { quarter: 'Q4', alpha: 58, beta: 44, gamma: 31 },
      ],
      x: 'quarter',
      y: ['alpha', 'beta', 'gamma'],
      seriesLabels: ['Product Alpha', 'Product Beta', 'Product Gamma'],
      yAxisLabel: 'Revenue (M USD)',
    },
  },
  {
    name: 'stacked-horizontal',
    input: {
      title: 'Education Attainment',
      data: [
        { country: 'Canada', bachelors: 32, masters: 12, doctoral: 1.4 },
        { country: 'Japan', bachelors: 31, masters: 6, doctoral: 0.9 },
        { country: 'Germany', bachelors: 22, masters: 12, doctoral: 1.5 },
        { country: 'United States', bachelors: 35, masters: 13, doctoral: 2 },
        { country: 'United Kingdom', bachelors: 33, masters: 14, doctoral: 1.6 },
      ],
      x: 'country',
      y: ['bachelors', 'masters', 'doctoral'],
      type: 'stacked',
      orientation: 'horizontal',
      seriesLabels: ['Bachelor’s', 'Master’s', 'Doctoral'],
      xAxisLabel: '% of population aged 25+',
      height: 420,
    },
  },
  {
    name: 'single-series',
    input: {
      data: [
        { month: 'Jan', value: 12 }, { month: 'Feb', value: 18 }, { month: 'Mar', value: 9 },
        { month: 'Apr', value: 24 }, { month: 'May', value: 31 }, { month: 'Jun', value: 27 },
      ],
      x: 'month',
      y: 'value',
      colors: ['#00C19A'],
      yAxisLabel: 'Deployments',
    },
  },
]
