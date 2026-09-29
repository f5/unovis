import React from 'react'
import { VisSingleContainer, VisCircularBar } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import { CircularBarConfigInterface } from '@unovis/ts'
import { getCircularBarColor } from '../palette'

export const title = 'Circular Bar Variants'
export const subTitle = 'Angle ranges, inner radius, corner radii and bar counts'

const values = [1, 0.7, 0.5, 0.9, 0.3, 0.6, 0.8, 0.45, 0.2, 0.95, 0.65, 0.35]
const manyValues = Array.from({ length: 24 }, (_, i) => 0.3 + 0.7 * Math.abs(Math.sin(1 + 1.3 * i)))

const cases: { label: string; data: number[]; config: Partial<CircularBarConfigInterface<number>> }[] = [
  { label: 'Defaults, 7 bars', data: values.slice(0, 7), config: {} },
  { label: 'No rounding', data: values.slice(0, 6), config: { cornerRadius: 0, innerCornerRadius: 0, barPadding: 4 } },
  { label: 'Top half [-π/2, π/2]', data: values.slice(0, 5), config: { angleRange: [-Math.PI / 2, Math.PI / 2] } },
  { label: 'Three-quarters, inner radius 40', data: values.slice(0, 6), config: { angleRange: [-3 * Math.PI / 4, 3 * Math.PI / 4], innerRadius: 40 } },
  { label: '12 bars, small padding', data: values, config: { barPadding: 3, cornerRadius: 12, innerCornerRadius: 4 } },
  { label: '24 bars, no background', data: manyValues, config: { showBackground: false } },
  { label: '2 bars, no rounding (arc fallback)', data: values.slice(0, 2), config: { cornerRadius: 0, innerCornerRadius: 0 } },
  { label: '1 bar (arc fallback)', data: values.slice(0, 1), config: {} },
  { label: 'Sorted, no background, fixed radius', data: values.slice(0, 7), config: { sortFunction: (a, b) => b - a, showBackground: false, radius: 80 } },
]

export const component = (props: ExampleViewerDurationProps): React.ReactNode => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, width: '100%' }}>
    {cases.map(c => (
      <div key={c.label} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 8, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{c.label}</div>
        <VisSingleContainer height={240}>
          <VisCircularBar<number>
            value={d => d}
            maxValue={1}
            color={getCircularBarColor}
            data={c.data}
            duration={props.duration}
            {...c.config}
          />
        </VisSingleContainer>
      </div>
    ))}
  </div>
)
