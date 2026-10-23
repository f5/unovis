export const DEFAULT_SAMPLE_INTERVAL = 250
export const DEFAULT_WINDOW_DURATION = 20000
export const FRAME_INTERVAL = 1000 / 30
export const BATCH_SIZE = 4
export const CHART_HEIGHT = 170
export const CHART_MARGIN = { top: 10, right: 36, bottom: 30, left: 40 }
export const SERIES_COLORS = ['#1F5BC7', '#CB3B54']
export const Y_DOMAIN: [number, number] = [0, 100]

export const STREAMING_CONFIGURATIONS = [
  { title: 'Line · individual samples', area: false, batchSize: 1 },
  { title: 'Area · individual samples', area: true, batchSize: 1 },
  { title: 'Line · batched samples', area: false, batchSize: BATCH_SIZE },
  { title: 'Area · batched samples', area: true, batchSize: BATCH_SIZE },
]
