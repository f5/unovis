export default [
  {
    name: 'donut-central-label',
    input: {
      title: 'Browser Market Share',
      data: [
        { browser: 'Chrome', share: 65.1 },
        { browser: 'Safari', share: 18.6 },
        { browser: 'Edge', share: 5.4 },
        { browser: 'Firefox', share: 2.8 },
        { browser: 'Other', share: 8.1 },
      ],
      value: 'share',
      label: 'browser',
      centralLabel: '4.9B',
      centralSubLabel: 'internet users',
      sortDescending: true,
    },
  },
  {
    name: 'pie',
    input: {
      data: [
        { stage: 'Organic', count: 4200 },
        { stage: 'Paid', count: 2800 },
        { stage: 'Referral', count: 1300 },
      ],
      value: 'count',
      label: 'stage',
      variant: 'pie',
      width: 480,
      height: 400,
    },
  },
]
