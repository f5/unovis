import React from 'react'
import { VisSingleContainer, VisRadialBar } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Radial Bar Min Angle'
export const subTitle = 'Keeping bars with tiny and zero values visible'

type DataRecord = { key: string; value: number | null }

const data: DataRecord[] = [
  { key: 'Errors', value: 0.05 },
  { key: 'Warnings', value: 12 },
  { key: 'Info', value: 64 },
  { key: 'Debug', value: 0 },
  { key: 'Trace', value: null }, // Missing data: the bar is not rendered
]

const cases: {
  label: string;
  barMinAngle: number;
  angleRange?: [number, number];
  padAngle?: number;
}[] = [
  { label: 'barMinAngle: 0 (disabled)', barMinAngle: 0 },
  { label: 'barMinAngle: 0.01 (default)', barMinAngle: 0.01 },
  { label: 'barMinAngle: 0.2', barMinAngle: 0.2 },
  { label: 'barMinAngle: 0.2, padAngle: 0.05', barMinAngle: 0.2, padAngle: 0.05 },
  { label: 'barMinAngle: 0.2, top half', barMinAngle: 0.2, angleRange: [-Math.PI / 2, Math.PI / 2] },
  { label: 'barMinAngle: 0.2, reversed range', barMinAngle: 0.2, angleRange: [0, -2 * Math.PI] },
  { label: 'barMinAngle: 10 → clamped to 2π', barMinAngle: 10 },
]

export const component = (props: ExampleViewerDurationProps): React.ReactNode => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, width: '100%' }}>
    {cases.map(c => (
      <div key={c.label} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 8, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{c.label}</div>
        <VisSingleContainer height={240}>
          <VisRadialBar<DataRecord>
            value={d => d.value}
            maxValue={100}
            data={data}
            duration={props.duration}
            angleRange={c.angleRange}
            padAngle={c.padAngle}
            barMinAngle={c.barMinAngle}
            trackWidth={14}
            trackPadding={4}
            cornerRadius={7}
          />
        </VisSingleContainer>
      </div>
    ))}
  </div>
)
