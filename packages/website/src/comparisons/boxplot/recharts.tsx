import React from 'react'
import {
  Bar,
  BarChart,
  BarShapeProps,
  CartesianGrid,
  DefaultZIndexes,
  ErrorBar,
  Rectangle,
  Scatter,
  Tooltip,
  TooltipContentProps,
  XAxis,
  YAxis,
} from 'recharts'

import type { ChartProps } from '../types'
import { BoxStats, DataRecord, getBoxStats, formatMs } from './data'

// Recharts doesn't have a default color palette: the box and outlier colors are from its box plot example, the
// palette for the "Colors" preset from its pie chart examples
const boxColor = '#8884d8'
const outlierColor = '#e11d48'
const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export default function RechartsBoxPlot ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const textColor = isDark ? '#aaa' : '#666'
  const minMax = preset === 'min-max'
  // Recharts has no box plot: its docs example draws one from precomputed statistics, with a bar from Q1 to Q3,
  // a custom shape for the median, an error bar for the whiskers and a scatter for the outliers
  const boxes = data.map(d => getBoxStats(d, minMax ? 'min-max' : 'tukey'))
  const outliers = boxes.flatMap(b => b.outliers.map(value => ({ endpoint: b.endpoint, value })))

  const renderBox = (props: BarShapeProps): JSX.Element => {
    const box = props.payload as BoxStats
    const medianY = props.y + ((box.q3 - box.median) / (box.q3 - box.q1)) * props.height
    return (
      <g>
        <Rectangle {...props} fill={preset === 'colors' ? colors[props.index] : boxColor} radius={preset === 'rounded' ? 8 : 0}/>
        <line x1={props.x} x2={props.x + props.width} y1={medianY} y2={medianY} stroke={isDark ? '#ddd' : '#1f2937'} strokeWidth={2}/>
      </g>
    )
  }

  const renderTooltip = ({ active, payload }: TooltipContentProps<number, string>): JSX.Element => {
    const box = payload?.[0]?.payload as BoxStats | undefined
    if (!active || !box?.q3) return null
    return (
      <div style={{ background: isDark ? '#222' : '#fff', border: `1px solid ${isDark ? '#444' : '#ccc'}`, padding: 10 }}>
        <div>{box.endpoint}</div>
        <div>{minMax ? 'Max' : 'Upper whisker'}: {formatMs(box.high)}</div>
        <div>Q3: {formatMs(box.q3)}</div>
        <div>Median: {formatMs(box.median)}</div>
        <div>Q1: {formatMs(box.q1)}</div>
        <div>{minMax ? 'Min' : 'Lower whisker'}: {formatMs(box.low)}</div>
      </div>
    )
  }

  return (
    <BarChart data={boxes} responsive style={{ height: '100%' }} margin={{ top: 5, right: 10, left: 5 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#444' : '#ccc'}/>
      <XAxis dataKey="endpoint" allowDuplicatedCategory={false} stroke={textColor}/>
      <YAxis width="auto" tickFormatter={formatMs} stroke={textColor}/>
      {/* A bar's value can be a [from, to] range; the error bar's errors are measured from the bar's end, Q3 */}
      <Bar dataKey={(b: BoxStats) => [b.q1, b.q3]} shape={renderBox}>
        <ErrorBar dataKey={(b: BoxStats) => [b.q3 - b.low, b.high - b.q3]} width={0} stroke={textColor} zIndex={DefaultZIndexes.bar - 1}/>
      </Bar>
      <Scatter data={outliers} dataKey="value" fill={outlierColor}/>
      <Tooltip content={renderTooltip} cursor={{ fill: isDark ? '#333' : '#eee' }}/>
    </BarChart>
  )
}
