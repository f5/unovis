import React from 'react'
import { VisXYContainer, VisAxis } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import { ContinuousScale, Scale } from '@unovis/ts'

export const title = 'Adaptive Ticks'
export const subTitle = 'Tick count fitted to the width'

const timeTickFormat = Scale.scaleTime().tickFormat() as (tick: number | Date) => string

type AxisExample = {
  label: string;
  domain: [number, number];
  scale?: ContinuousScale;
  tickFormat?: (tick: number | Date) => string;
  tickTextAngle?: number;
  tickValues?: number[];
}

const axes: AxisExample[] = [
  { label: '[0, 1000]', domain: [0, 1000] },
  { label: 'custom tickValues, 0..1000 by 100', domain: [0, 1000], tickValues: Array.from({ length: 11 }, (_, i) => i * 100) },
  { label: '[-500, 500]', domain: [-500, 500] },
  { label: '[0, 1]', domain: [0, 1] },
  { label: '[0, 10000000]', domain: [0, 10000000] },
  { label: '[0, 10000000], rotated labels', domain: [0, 10000000], tickTextAngle: 15 },
  { label: 'time scale, 6 months', domain: [+new Date(2026, 0, 1), +new Date(2026, 6, 1)], scale: Scale.scaleTime(), tickFormat: timeTickFormat },
  { label: 'time scale, 48 hours', domain: [+new Date(2026, 0, 1), +new Date(2026, 0, 3)], scale: Scale.scaleTime(), tickFormat: timeTickFormat },
]

const labelStyle: React.CSSProperties = { font: '11px monospace', color: '#888', margin: '12px 0 2px' }

export const component = (props: ExampleViewerDurationProps): React.ReactNode => (
  <>
    {axes.map(axis => (
      <div key={axis.label}>
        <div style={labelStyle}>{axis.label}</div>
        <VisXYContainer xDomain={axis.domain} height={40} xScale={axis.scale}>
          <VisAxis
            type='x'
            numTicks={25}
            tickTextAdaptiveSets={true}
            tickTextHideOverlapping={true}
            tickFormat={axis.tickFormat}
            tickTextAngle={axis.tickTextAngle}
            tickValues={axis.tickValues}
            duration={props.duration}
          />
        </VisXYContainer>
      </div>
    ))}
  </>
)
