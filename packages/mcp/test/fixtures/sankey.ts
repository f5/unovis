export default [
  {
    name: 'budget-flow',
    input: {
      title: 'Monthly Budget Flow',
      links: [
        { source: 'Salary', target: 'Budget', value: 5200 },
        { source: 'Freelance', target: 'Budget', value: 1400 },
        { source: 'Budget', target: 'Rent', value: 2100 },
        { source: 'Budget', target: 'Groceries', value: 900 },
        { source: 'Budget', target: 'Transport', value: 350 },
        { source: 'Budget', target: 'Savings', value: 2450 },
        { source: 'Budget', target: 'Leisure', value: 800 },
      ],
      valueSuffix: ' USD',
      height: 420,
    },
  },
]
