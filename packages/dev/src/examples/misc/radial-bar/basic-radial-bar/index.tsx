import React from 'react'
import { VisSingleContainer, VisRadialBar, VisRadialBarSelectors, VisTooltip } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import type { RadialBarArcDatum } from '@unovis/ts'

export const title = 'Basic Radial Bar'
export const subTitle = 'Per-datum max, tooltip, and a central label'

type DataRecord = { key: string; value: number; unit: string }

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const data: DataRecord[] = [
    { key: 'Steps', value: 8300, unit: 'steps' },
    { key: 'Calories', value: 420, unit: 'kcal' },
    { key: 'Move', value: 25, unit: 'min' },
  ]
  const maxValue = [10000, 600, 30]
  const completion = Math.round(100 * data.reduce((sum, d, i) => sum + d.value / maxValue[i], 0) / data.length)

  return (
    <VisSingleContainer height={400}>
      <VisRadialBar<DataRecord>
        value={d => d.value}
        maxValue={maxValue}
        data={data}
        duration={props.duration}
        trackWidth={18}
        trackPadding={4}
        cornerRadius={9}
        centralLabel={`${completion}%`}
        centralSubLabel="daily goals"
      />
      <VisTooltip triggers={{
        [VisRadialBarSelectors.bar]: (d: RadialBarArcDatum<DataRecord>) => {
          const max = maxValue[d.index] ?? '—'
          return `<strong>${d.data.key}</strong><br/>${d.value} / ${max} ${d.data.unit}`
        },
      }}
      />
    </VisSingleContainer>
  )
}
