import React from 'react'
import { VisSingleContainer, VisRadialBar } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Partial Radial Bar'
export const subTitle = 'Varying angle ranges to test container fit'

type DataRecord = { key: string; value: number }

const data: DataRecord[] = [
  { key: 'Storage', value: 70 },
  { key: 'Memory', value: 48 },
  { key: 'CPU', value: 32 },
]

const cases: {
  label: string;
  angleRange: [number, number];
  centralLabelOffsetY: number;
  textAnchor: 'start' | 'middle' | 'end';
}[] = [
  { label: 'Top half [-π/2, π/2]', angleRange: [-Math.PI / 2, Math.PI / 2], centralLabelOffsetY: -20, textAnchor: 'middle' },
  { label: 'Bottom half [π/2, 3π/2]', angleRange: [Math.PI / 2, 3 * Math.PI / 2], centralLabelOffsetY: 20, textAnchor: 'middle' },
  { label: 'Right half [0, π]', angleRange: [0, Math.PI], centralLabelOffsetY: 0, textAnchor: 'end' },
  { label: 'Left half [-π, 0]', angleRange: [-Math.PI, 0], centralLabelOffsetY: 0, textAnchor: 'start' },
  { label: 'Top-right quarter [0, π/2]', angleRange: [0, Math.PI / 2], centralLabelOffsetY: -80, textAnchor: 'start' },
  { label: 'Top three-quarters [-3π/4, 3π/4]', angleRange: [-3 * Math.PI / 4, 3 * Math.PI / 4], centralLabelOffsetY: 0, textAnchor: 'middle' },
  { label: '270° gauge [-3π/4, 3π/4] (alt)', angleRange: [-2 * Math.PI / 3, 2 * Math.PI / 3], centralLabelOffsetY: 0, textAnchor: 'middle' },
  { label: 'Narrow wedge [-π/6, π/6]', angleRange: [-Math.PI / 6, Math.PI / 6], centralLabelOffsetY: -100, textAnchor: 'middle' },
]

export const component = (props: ExampleViewerDurationProps): React.ReactNode => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16, width: '100%' }}>
    {cases.map(c => {
      const cssVars = {
        '--vis-radial-bar-central-label-text-anchor': c.textAnchor,
        '--vis-radial-bar-central-sub-label-text-anchor': c.textAnchor,
      } as React.CSSProperties
      return (
        <div key={c.label} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 8, minWidth: 0, ...cssVars }}>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{c.label}</div>
          <VisSingleContainer height={260}>
            <VisRadialBar<DataRecord>
              value={d => d.value}
              maxValue={100}
              data={data}
              duration={props.duration}
              angleRange={c.angleRange}
              trackWidth={14}
              trackPadding={4}
              cornerRadius={6}
              centralLabel="Health"
              centralSubLabel="overall load"
              centralLabelOffsetY={c.centralLabelOffsetY}
            />
          </VisSingleContainer>
        </div>
      )
    })}
  </div>
)
