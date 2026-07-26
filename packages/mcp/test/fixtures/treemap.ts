export default [
  {
    name: 'two-layer-cloud-costs',
    input: {
      title: 'Monthly Cloud Spend by Team',
      data: [
        { team: 'Platform', service: 'Compute', cost: 18400 },
        { team: 'Platform', service: 'Storage', cost: 7200 },
        { team: 'Platform', service: 'Networking', cost: 4100 },
        { team: 'Data', service: 'Warehouse', cost: 12600 },
        { team: 'Data', service: 'Streaming', cost: 5300 },
        { team: 'Data', service: 'Orchestration', cost: 1900 },
        { team: 'ML', service: 'Training GPUs', cost: 15800 },
        { team: 'ML', service: 'Inference', cost: 6700 },
        { team: 'Web', service: 'CDN', cost: 3200 },
        { team: 'Web', service: 'Hosting', cost: 2400 },
      ],
      layers: ['team', 'service'],
      value: 'cost',
      height: 440,
    },
  },
  {
    name: 'single-layer',
    input: {
      data: [
        { language: 'TypeScript', repos: 214 },
        { language: 'Python', repos: 167 },
        { language: 'Go', repos: 88 },
        { language: 'Rust', repos: 41 },
        { language: 'Java', repos: 35 },
        { language: 'Shell', repos: 22 },
      ],
      layers: ['language'],
      value: 'repos',
      width: 560,
      height: 360,
    },
  },
]
