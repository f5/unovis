export default [
  {
    name: 'project-gantt',
    input: {
      title: 'Website Redesign Plan',
      data: [
        { phase: 'Discovery', from: '2024-01-08', to: '2024-01-26' },
        { phase: 'Design', from: '2024-01-22', to: '2024-02-23' },
        { phase: 'Design', from: '2024-03-04', to: '2024-03-15' },
        { phase: 'Engineering', from: '2024-02-12', to: '2024-04-05' },
        { phase: 'Content', from: '2024-02-26', to: '2024-03-22' },
        { phase: 'QA', from: '2024-03-25', to: '2024-04-12' },
        { phase: 'Launch', from: '2024-04-15', to: '2024-04-19' },
      ],
      row: 'phase',
      start: 'from',
      end: 'to',
      rowHeight: 34,
      roundedEnds: true,
      height: 300,
    },
  },
  {
    name: 'trace-spans-duration',
    input: {
      title: 'Request Trace',
      data: [
        { service: 'gateway', startMs: 0, tookMs: 182 },
        { service: 'auth', startMs: 4, tookMs: 26 },
        { service: 'search-api', startMs: 34, tookMs: 118 },
        { service: 'ranking', startMs: 96, tookMs: 41 },
        { service: 'ads', startMs: 38, tookMs: 64 },
        { service: 'ads', startMs: 121, tookMs: 18 },
        { service: 'render', startMs: 156, tookMs: 22 },
      ],
      row: 'service',
      start: 'startMs',
      duration: 'tookMs',
      xAxisLabel: 'Milliseconds since request start',
      rowHeight: 28,
      height: 280,
    },
  },
]
