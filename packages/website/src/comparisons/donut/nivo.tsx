import React from 'react'
import { ResponsivePie, PieCustomLayerProps } from '@nivo/pie'
import { patternDotsDef, patternLinesDef, patternSquaresDef } from '@nivo/core'

import type { ChartProps } from '../types'
import { DataRecord, formatValue, getTotal } from './data'
import { IconSymbols, ICON_SIZE, iconId } from './icon-symbols'

const darkTheme = {
  text: { fill: '#ccc' },
  tooltip: { container: { background: '#222', color: '#ccc' } },
}

// Nivo's built-in patterns, drawn over the slice color (`background: 'inherit'`), one per traffic source
const pattern = { background: 'inherit', color: 'rgba(255, 255, 255, 0.5)' }
const patternDefs = [
  patternLinesDef('lines-diagonal', { ...pattern, rotation: -45, spacing: 8, lineWidth: 2 }),
  patternDotsDef('dots', { ...pattern, size: 3, padding: 3, stagger: true }),
  patternLinesDef('lines-vertical', { ...pattern, rotation: 90, spacing: 8, lineWidth: 2 }),
  patternSquaresDef('squares', { ...pattern, size: 4, padding: 3 }),
  patternLinesDef('lines-horizontal', { ...pattern, spacing: 6, lineWidth: 2 }),
  patternDotsDef('dots-large', { ...pattern, size: 6, padding: 3 }),
]

export default function NivoDonutChart ({ data, isDark, preset }: ChartProps<DataRecord[]>): JSX.Element {
  const isHalf = preset === 'half'

  // Nivo doesn't have a center label option, so we render it as a custom layer
  const centerLabel = ({ centerX, centerY }: PieCustomLayerProps<{ id: string; value: number }>): JSX.Element => (
    <text x={centerX} y={centerY} textAnchor="middle" dominantBaseline={isHalf ? 'auto' : 'central'} fontWeight="bold" fill={isDark ? '#ccc' : '#333'}>
      {formatValue(getTotal(data))} total
    </text>
  )

  // Nivo's arc labels are text, so the icons are a custom layer at the arcs' centroids
  const icons = ({ dataWithArc, centerX, centerY, arcGenerator }: PieCustomLayerProps<{ id: string; value: number }>): JSX.Element => (
    <g transform={`translate(${centerX}, ${centerY})`} color="white">
      <defs><IconSymbols/></defs>
      {dataWithArc.filter(d => d.value > 0).map(d => {
        const [x, y] = arcGenerator.centroid(d.arc)
        return <use key={d.id} href={`#${iconId(d.id)}`} x={x - ICON_SIZE / 2} y={y - ICON_SIZE / 2} width={ICON_SIZE} height={ICON_SIZE}/>
      })}
    </g>
  )

  return (
    <ResponsivePie
      data={data.map(d => ({ id: d.source, value: d.sessions }))}
      theme={isDark ? darkTheme : undefined}
      margin={{ top: 10, right: 130, bottom: 10, left: 10 }}
      innerRadius={0.6}
      // Degrees, clockwise from 12 o'clock; `fit` (on by default) scales the half ring up to the available space
      startAngle={isHalf ? -90 : 0}
      endAngle={isHalf ? 90 : 360}
      padAngle={preset === 'rounded' ? 2 : 0}
      cornerRadius={preset === 'rounded' ? 6 : 0}
      defs={preset === 'patterns' ? patternDefs : []}
      fill={preset === 'patterns' ? data.map((d, i) => ({ match: { id: d.source }, id: patternDefs[i % patternDefs.length].id })) : []}
      valueFormat={formatValue}
      enableArcLabels={false}
      enableArcLinkLabels={false}
      layers={preset === 'icons' ? ['arcs', 'legends', centerLabel, icons] : ['arcs', 'legends', centerLabel]}
      legends={[{ anchor: 'right', direction: 'column', translateX: 120, itemWidth: 110, itemHeight: 22, toggleSerie: true }]}
    />
  )
}
