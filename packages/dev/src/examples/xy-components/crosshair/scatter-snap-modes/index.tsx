import React, { useMemo } from 'react'
import { CrosshairSnapMode } from '@unovis/ts'
import { VisXYContainer, VisScatter, VisAxis, VisCrosshair, VisTooltip } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

const NUM_POINTS = 1500

type ScatterRecord = {
  x: number;
  y: number;
}

// Seeded RNG so the layout is stable across renders (mirrors `scatter-performance`).
function generateScatterData (seed = 42): ScatterRecord[] {
  let s = seed
  const random = (): number => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }

  // Points are clustered into a handful of X bands so that many points share a similar X.
  // This is exactly the case where X-only snapping picks a point that's far away in Y.
  return Array.from({ length: NUM_POINTS }, () => {
    const band = Math.floor(random() * 12)
    return {
      x: band * 8 + random() * 4,
      y: random() * 100,
    }
  })
}

const tooltipTemplate = (d: ScatterRecord): string =>
  `x: ${d.x.toFixed(1)}, y: ${d.y.toFixed(1)}`

const chartStyle = {
  flex: '1 1 360px',
  minWidth: 320,
  '--vis-crosshair-line-stroke-color': '#aaa',
  '--vis-crosshair-line-stroke-dasharray': '8 4',
} as React.CSSProperties

export const title = 'Scatter Crosshair Snap (X vs XY)'
export const subTitle = `${NUM_POINTS.toLocaleString()} clustered points`

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const data = useMemo(() => generateScatterData(), [])

  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <div style={chartStyle}>
        <strong>CrosshairSnapMode.X</strong> (default — snaps along X only)
        <VisXYContainer<ScatterRecord> data={data} margin={{ top: 5, left: 5 }} height={400}>
          <VisScatter<ScatterRecord> x={d => d.x} y={d => d.y} size={5} duration={props.duration}/>
          <VisAxis type='x' duration={props.duration}/>
          <VisAxis type='y' duration={props.duration}/>
          <VisCrosshair<ScatterRecord> snapMode={CrosshairSnapMode.X} showHorizontalLine={true} template={tooltipTemplate}/>
          <VisTooltip/>
        </VisXYContainer>
      </div>
      <div style={chartStyle}>
        <strong>CrosshairSnapMode.XY</strong> (snaps to the closest point in X and Y)
        <VisXYContainer<ScatterRecord> data={data} margin={{ top: 5, left: 5 }} height={400}>
          <VisScatter<ScatterRecord> x={d => d.x} y={d => d.y} size={5} duration={props.duration}/>
          <VisAxis type='x' duration={props.duration}/>
          <VisAxis type='y' duration={props.duration}/>
          <VisCrosshair<ScatterRecord> snapMode={CrosshairSnapMode.XY} showHorizontalLine={true} template={tooltipTemplate}/>
          <VisTooltip/>
        </VisXYContainer>
      </div>
    </div>
  )
}
