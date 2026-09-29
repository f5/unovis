import React from 'react'
import { VisSingleContainer, VisCircularBar, VisCircularBarSelectors, VisTooltip } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import type { CircularBarArcDatum } from '@unovis/ts'
import { getCircularBarColor } from '../palette'
import { getCircularBarIcon, circularBarIconStyle } from '../icons'

export const title = 'Basic Circular Bar'
export const subTitle = 'Petal-shaped bars with icons, per-datum max and a tooltip'

type DataRecord = { key: string; value: number; unit: string }

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const data: DataRecord[] = [
    { key: 'Mindfulness', value: 12, unit: 'min' },
    { key: 'Nutrition', value: 1650, unit: 'kcal' },
    { key: 'Activity', value: 8300, unit: 'steps' },
    { key: 'Heart', value: 62, unit: 'bpm' },
    { key: 'Body', value: 71, unit: 'kg' },
    { key: 'Sleep', value: 6.5, unit: 'h' },
    { key: 'Hearing', value: 85, unit: 'dB' },
  ]
  const maxValue = [15, 2000, 10000, 80, 80, 8, 100]

  return (
    <VisSingleContainer height={400} style={circularBarIconStyle}>
      <VisCircularBar<DataRecord>
        value={d => d.value}
        maxValue={maxValue}
        color={getCircularBarColor}
        icon={getCircularBarIcon}
        data={data}
        duration={props.duration}
      />
      <VisTooltip triggers={{
        [VisCircularBarSelectors.bar]: (d: CircularBarArcDatum<DataRecord>) => {
          const max = maxValue[d.index] ?? '—'
          return `<strong>${d.data.key}</strong><br/>${d.value} / ${max} ${d.data.unit}`
        },
      }}
      />
    </VisSingleContainer>
  )
}
