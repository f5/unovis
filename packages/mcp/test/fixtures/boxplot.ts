const services = ['Auth', 'Search', 'Checkout', 'Profile', 'Billing']

export default [
  {
    name: 'latency-by-service',
    input: {
      title: 'API Latency by Service',
      data: services.flatMap((service, s) =>
        Array.from({ length: 40 }, (_, i) => ({
          service,
          latency: Math.round(
            55 + s * 28 +
            Math.abs(Math.sin(i * 2.31 + s * 1.7)) * (70 + s * 22) +
            (i % 9 === 0 ? 60 + s * 10 : 0) // occasional slow requests
          ),
        }))),
      groupBy: 'service',
      value: 'latency',
      yAxisLabel: 'Latency (ms)',
    },
  },
  {
    name: 'exam-scores',
    input: {
      data: [
        { class: 'Class A', score: 62 }, { class: 'Class A', score: 71 }, { class: 'Class A', score: 74 },
        { class: 'Class A', score: 78 }, { class: 'Class A', score: 81 }, { class: 'Class A', score: 83 },
        { class: 'Class A', score: 86 }, { class: 'Class A', score: 88 }, { class: 'Class A', score: 94 },
        { class: 'Class B', score: 48 }, { class: 'Class B', score: 55 }, { class: 'Class B', score: 61 },
        { class: 'Class B', score: 66 }, { class: 'Class B', score: 68 }, { class: 'Class B', score: 72 },
        { class: 'Class B', score: 75 }, { class: 'Class B', score: 79 }, { class: 'Class B', score: 97 },
        { class: 'Class C', score: 70 }, { class: 'Class C', score: 76 }, { class: 'Class C', score: 79 },
        { class: 'Class C', score: 82 }, { class: 'Class C', score: 84 }, { class: 'Class C', score: 85 },
        { class: 'Class C', score: 87 }, { class: 'Class C', score: 90 }, { class: 'Class C', score: 92 },
      ],
      groupBy: 'class',
      value: 'score',
      boxMaxWidth: 90,
      roundedCorners: 4,
      colors: ['#6859BE'],
      yAxisLabel: 'Score',
      height: 400,
    },
  },
]
