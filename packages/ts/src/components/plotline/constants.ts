import { PlotlineLineStylePresets, PlotlineLabelPosition, PlotlineLayoutMap, LineStyleValue } from './types'

export const LINE_STYLE: Record<PlotlineLineStylePresets, LineStyleValue | 'none'> = {
  solid: 'none',
  shortDash: '6,2',
  shortDot: '2,2',
  shortDashDot: '6,2,2,2',
  shortDashDotDot: '6,2,2,2,2,2',
  dot: '2,6',
  dash: '8,6',
  longDash: '16,6',
  dashDot: '8,6,2,6',
  longDashDot: '16,6,2,6',
  longDashDotDot: '16,6,2,6,2,6',
}

export const HORIZONTAL_X: PlotlineLayoutMap = {
  [PlotlineLabelPosition.TopLeft]: ({ width, offsetX, offsetY }) => ({ x: width - offsetX, y: offsetY, textAnchor: 'end', dominantBaseline: 'text-before-edge' }),
  [PlotlineLabelPosition.Top]: ({ width, offsetY }) => ({ x: width, y: offsetY, textAnchor: 'middle', dominantBaseline: 'text-before-edge' }),
  [PlotlineLabelPosition.TopRight]: ({ width, offsetX, offsetY }) => ({ x: width + offsetX, y: offsetY, textAnchor: 'start', dominantBaseline: 'text-before-edge' }),
  [PlotlineLabelPosition.Right]: ({ width, height, offsetX }) => ({ x: width + offsetX, y: height / 2, textAnchor: 'start', dominantBaseline: 'middle' }),
  [PlotlineLabelPosition.BottomRight]: ({ width, height, offsetX, offsetY }) => ({ x: width + offsetX, y: height - offsetY, textAnchor: 'start', dominantBaseline: 'text-after-edge' }),
  [PlotlineLabelPosition.Bottom]: ({ width, height, offsetY }) => ({ x: width, y: height - offsetY, textAnchor: 'middle', dominantBaseline: 'text-after-edge' }),
  [PlotlineLabelPosition.BottomLeft]: ({ width, height, offsetX, offsetY }) => ({ x: width - offsetX, y: height - offsetY, textAnchor: 'end', dominantBaseline: 'text-after-edge' }),
  [PlotlineLabelPosition.Left]: ({ width, height, offsetX }) => ({ x: width - offsetX, y: height / 2, textAnchor: 'end', dominantBaseline: 'middle' }),
}

export const VERTICAL_X: PlotlineLayoutMap = {
  [PlotlineLabelPosition.TopLeft]: ({ width, offsetX, offsetY }) => ({ x: width - offsetX, y: offsetY, textAnchor: 'end', dominantBaseline: 'text-after-edge' }),
  [PlotlineLabelPosition.Top]: ({ width, offsetY }) => ({ x: width, y: offsetY, textAnchor: 'end', dominantBaseline: 'middle' }),
  [PlotlineLabelPosition.TopRight]: ({ width, offsetX, offsetY }) => ({ x: width + offsetX, y: offsetY, textAnchor: 'end', dominantBaseline: 'text-before-edge' }),
  [PlotlineLabelPosition.Right]: ({ width, height, offsetX }) => ({ x: width + offsetX, y: height / 2, textAnchor: 'middle', dominantBaseline: 'text-before-edge' }),
  [PlotlineLabelPosition.BottomRight]: ({ width, height, offsetX, offsetY }) => ({ x: width + offsetX, y: height - offsetY, textAnchor: 'start', dominantBaseline: 'text-before-edge' }),
  [PlotlineLabelPosition.Bottom]: ({ width, height, offsetY }) => ({ x: width, y: height - offsetY, textAnchor: 'start', dominantBaseline: 'middle' }),
  [PlotlineLabelPosition.BottomLeft]: ({ width, height, offsetX, offsetY }) => ({ x: width - offsetX, y: height - offsetY, textAnchor: 'start', dominantBaseline: 'text-after-edge' }),
  [PlotlineLabelPosition.Left]: ({ width, height, offsetX }) => ({ x: width - offsetX, y: height / 2, textAnchor: 'middle', dominantBaseline: 'text-after-edge' }),
}

export const HORIZONTAL_Y: PlotlineLayoutMap = {
  [PlotlineLabelPosition.TopLeft]: ({ offsetX, height, offsetY }) => ({ x: offsetX, y: height - offsetY, textAnchor: 'start', dominantBaseline: 'text-after-edge' }),
  [PlotlineLabelPosition.Top]: ({ width, height, offsetY }) => ({ x: width / 2, y: height - offsetY, textAnchor: 'middle', dominantBaseline: 'text-after-edge' }),
  [PlotlineLabelPosition.TopRight]: ({ width, offsetX, height, offsetY }) => ({ x: width - offsetX, y: height - offsetY, textAnchor: 'end', dominantBaseline: 'text-after-edge' }),
  [PlotlineLabelPosition.Right]: ({ width, offsetX, height }) => ({ x: width - offsetX, y: height, textAnchor: 'end', dominantBaseline: 'middle' }),
  [PlotlineLabelPosition.BottomRight]: ({ width, offsetX, height, offsetY }) => ({ x: width - offsetX, y: height + offsetY, textAnchor: 'end', dominantBaseline: 'text-before-edge' }),
  [PlotlineLabelPosition.Bottom]: ({ width, height, offsetY }) => ({ x: width / 2, y: height + offsetY, textAnchor: 'middle', dominantBaseline: 'text-before-edge' }),
  [PlotlineLabelPosition.BottomLeft]: ({ offsetX, height, offsetY }) => ({ x: offsetX, y: height + offsetY, textAnchor: 'start', dominantBaseline: 'text-before-edge' }),
  [PlotlineLabelPosition.Left]: ({ offsetX, height }) => ({ x: offsetX, y: height, textAnchor: 'start', dominantBaseline: 'middle' }),
}

export const VERTICAL_Y: PlotlineLayoutMap = {
  [PlotlineLabelPosition.TopLeft]: ({ offsetX, height, offsetY }) => ({ x: offsetX, y: height - offsetY, textAnchor: 'start', dominantBaseline: 'text-before-edge' }),
  [PlotlineLabelPosition.Top]: ({ width, height, offsetY }) => ({ x: width / 2, y: height - offsetY, textAnchor: 'start', dominantBaseline: 'central' }),
  [PlotlineLabelPosition.TopRight]: ({ width, offsetX, height, offsetY }) => ({ x: width - offsetX, y: height - offsetY, textAnchor: 'start', dominantBaseline: 'text-after-edge' }),
  [PlotlineLabelPosition.Right]: ({ width, offsetX, height }) => ({ x: width - offsetX, y: height, textAnchor: 'middle', dominantBaseline: 'text-after-edge' }),
  [PlotlineLabelPosition.BottomRight]: ({ width, offsetX, height, offsetY }) => ({ x: width - offsetX, y: height + offsetY, textAnchor: 'end', dominantBaseline: 'text-after-edge' }),
  [PlotlineLabelPosition.Bottom]: ({ width, height, offsetY }) => ({ x: width / 2, y: height + offsetY, textAnchor: 'end', dominantBaseline: 'central' }),
  [PlotlineLabelPosition.BottomLeft]: ({ offsetX, height, offsetY }) => ({ x: offsetX, y: height + offsetY, textAnchor: 'end', dominantBaseline: 'text-before-edge' }),
  [PlotlineLabelPosition.Left]: ({ offsetX, height }) => ({ x: offsetX, y: height, textAnchor: 'middle', dominantBaseline: 'text-before-edge' }),
}
