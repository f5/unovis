export default [
  {
    name: 'brand-switching',
    input: {
      title: 'Phone Brand Switching',
      links: [
        { source: 'Apple', target: 'Samsung', value: 11 },
        { source: 'Apple', target: 'Google', value: 6 },
        { source: 'Samsung', target: 'Apple', value: 14 },
        { source: 'Samsung', target: 'Google', value: 9 },
        { source: 'Google', target: 'Apple', value: 8 },
        { source: 'Google', target: 'Samsung', value: 5 },
        { source: 'Other', target: 'Apple', value: 12 },
        { source: 'Other', target: 'Samsung', value: 10 },
        { source: 'Other', target: 'Google', value: 4 },
      ],
      height: 520,
    },
  },
  {
    name: 'team-collaboration-perpendicular',
    input: {
      links: [
        { source: 'eng', target: 'design', value: 42 },
        { source: 'eng', target: 'product', value: 65 },
        { source: 'design', target: 'product', value: 38 },
        { source: 'product', target: 'sales', value: 27 },
        { source: 'sales', target: 'support', value: 33 },
        { source: 'support', target: 'eng', value: 19 },
        { source: 'design', target: 'marketing', value: 24 },
        { source: 'marketing', target: 'sales', value: 31 },
      ],
      nodes: [
        { id: 'eng', label: 'Engineering' },
        { id: 'design', label: 'Design' },
        { id: 'product', label: 'Product' },
        { id: 'sales', label: 'Sales' },
        { id: 'support', label: 'Support' },
        { id: 'marketing', label: 'Marketing' },
      ],
      labelAlignment: 'perpendicular',
      padAngle: 0.05,
      width: 640,
      height: 560,
    },
  },
]
