import { TextAlign, VerticalAlign } from '@/types/text'
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
  [PlotlineLabelPosition.TopLeft]: ({ width, offsetX, offsetY }) => ({ x: width - offsetX, y: offsetY, textAlign: TextAlign.Right, verticalAlign: VerticalAlign.Top }),
  [PlotlineLabelPosition.Top]: ({ width, offsetY }) => ({ x: width, y: offsetY, textAlign: TextAlign.Center, verticalAlign: VerticalAlign.Top }),
  [PlotlineLabelPosition.TopRight]: ({ width, offsetX, offsetY }) => ({ x: width + offsetX, y: offsetY, textAlign: TextAlign.Left, verticalAlign: VerticalAlign.Top }),
  [PlotlineLabelPosition.Right]: ({ width, height, offsetX }) => ({ x: width + offsetX, y: height / 2, textAlign: TextAlign.Left, verticalAlign: VerticalAlign.Middle }),
  [PlotlineLabelPosition.BottomRight]: ({ width, height, offsetX, offsetY }) => ({ x: width + offsetX, y: height - offsetY, textAlign: TextAlign.Left, verticalAlign: VerticalAlign.Bottom }),
  [PlotlineLabelPosition.Bottom]: ({ width, height, offsetY }) => ({ x: width, y: height - offsetY, textAlign: TextAlign.Center, verticalAlign: VerticalAlign.Bottom }),
  [PlotlineLabelPosition.BottomLeft]: ({ width, height, offsetX, offsetY }) => ({ x: width - offsetX, y: height - offsetY, textAlign: TextAlign.Right, verticalAlign: VerticalAlign.Bottom }),
  [PlotlineLabelPosition.Left]: ({ width, height, offsetX }) => ({ x: width - offsetX, y: height / 2, textAlign: TextAlign.Right, verticalAlign: VerticalAlign.Middle }),
}

export const VERTICAL_X: PlotlineLayoutMap = {
  [PlotlineLabelPosition.TopLeft]: ({ width, offsetX, offsetY }) => ({ x: width - offsetX, y: offsetY, textAlign: TextAlign.Right, verticalAlign: VerticalAlign.Bottom }),
  [PlotlineLabelPosition.Top]: ({ width, offsetY }) => ({ x: width, y: offsetY, textAlign: TextAlign.Right, verticalAlign: VerticalAlign.Middle }),
  [PlotlineLabelPosition.TopRight]: ({ width, offsetX, offsetY }) => ({ x: width + offsetX, y: offsetY, textAlign: TextAlign.Right, verticalAlign: VerticalAlign.Top }),
  [PlotlineLabelPosition.Right]: ({ width, height, offsetX }) => ({ x: width + offsetX, y: height / 2, textAlign: TextAlign.Center, verticalAlign: VerticalAlign.Top }),
  [PlotlineLabelPosition.BottomRight]: ({ width, height, offsetX, offsetY }) => ({ x: width + offsetX, y: height - offsetY, textAlign: TextAlign.Left, verticalAlign: VerticalAlign.Top }),
  [PlotlineLabelPosition.Bottom]: ({ width, height, offsetY }) => ({ x: width, y: height - offsetY, textAlign: TextAlign.Left, verticalAlign: VerticalAlign.Middle }),
  [PlotlineLabelPosition.BottomLeft]: ({ width, height, offsetX, offsetY }) => ({ x: width - offsetX, y: height - offsetY, textAlign: TextAlign.Left, verticalAlign: VerticalAlign.Bottom }),
  [PlotlineLabelPosition.Left]: ({ width, height, offsetX }) => ({ x: width - offsetX, y: height / 2, textAlign: TextAlign.Center, verticalAlign: VerticalAlign.Bottom }),
}

export const HORIZONTAL_Y: PlotlineLayoutMap = {
  [PlotlineLabelPosition.TopLeft]: ({ offsetX, height, offsetY }) => ({ x: offsetX, y: height - offsetY, textAlign: TextAlign.Left, verticalAlign: VerticalAlign.Bottom }),
  [PlotlineLabelPosition.Top]: ({ width, height, offsetY }) => ({ x: width / 2, y: height - offsetY, textAlign: TextAlign.Center, verticalAlign: VerticalAlign.Bottom }),
  [PlotlineLabelPosition.TopRight]: ({ width, offsetX, height, offsetY }) => ({ x: width - offsetX, y: height - offsetY, textAlign: TextAlign.Right, verticalAlign: VerticalAlign.Bottom }),
  [PlotlineLabelPosition.Right]: ({ width, offsetX, height }) => ({ x: width - offsetX, y: height, textAlign: TextAlign.Right, verticalAlign: VerticalAlign.Middle }),
  [PlotlineLabelPosition.BottomRight]: ({ width, offsetX, height, offsetY }) => ({ x: width - offsetX, y: height + offsetY, textAlign: TextAlign.Right, verticalAlign: VerticalAlign.Top }),
  [PlotlineLabelPosition.Bottom]: ({ width, height, offsetY }) => ({ x: width / 2, y: height + offsetY, textAlign: TextAlign.Center, verticalAlign: VerticalAlign.Top }),
  [PlotlineLabelPosition.BottomLeft]: ({ offsetX, height, offsetY }) => ({ x: offsetX, y: height + offsetY, textAlign: TextAlign.Left, verticalAlign: VerticalAlign.Top }),
  [PlotlineLabelPosition.Left]: ({ offsetX, height }) => ({ x: offsetX, y: height, textAlign: TextAlign.Left, verticalAlign: VerticalAlign.Middle }),
}

export const VERTICAL_Y: PlotlineLayoutMap = {
  [PlotlineLabelPosition.TopLeft]: ({ offsetX, height, offsetY }) => ({ x: offsetX, y: height - offsetY, textAlign: TextAlign.Left, verticalAlign: VerticalAlign.Top }),
  [PlotlineLabelPosition.Top]: ({ width, height, offsetY }) => ({ x: width / 2, y: height - offsetY, textAlign: TextAlign.Left, verticalAlign: VerticalAlign.Middle }),
  [PlotlineLabelPosition.TopRight]: ({ width, offsetX, height, offsetY }) => ({ x: width - offsetX, y: height - offsetY, textAlign: TextAlign.Left, verticalAlign: VerticalAlign.Bottom }),
  [PlotlineLabelPosition.Right]: ({ width, offsetX, height }) => ({ x: width - offsetX, y: height, textAlign: TextAlign.Center, verticalAlign: VerticalAlign.Bottom }),
  [PlotlineLabelPosition.BottomRight]: ({ width, offsetX, height, offsetY }) => ({ x: width - offsetX, y: height + offsetY, textAlign: TextAlign.Right, verticalAlign: VerticalAlign.Bottom }),
  [PlotlineLabelPosition.Bottom]: ({ width, height, offsetY }) => ({ x: width / 2, y: height + offsetY, textAlign: TextAlign.Right, verticalAlign: VerticalAlign.Middle }),
  [PlotlineLabelPosition.BottomLeft]: ({ offsetX, height, offsetY }) => ({ x: offsetX, y: height + offsetY, textAlign: TextAlign.Right, verticalAlign: VerticalAlign.Top }),
  [PlotlineLabelPosition.Left]: ({ offsetX, height }) => ({ x: offsetX, y: height, textAlign: TextAlign.Center, verticalAlign: VerticalAlign.Top }),
}
