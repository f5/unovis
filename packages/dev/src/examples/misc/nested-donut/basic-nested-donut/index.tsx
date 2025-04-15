import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'
import { generateNestedData, NestedDatum } from '@/utils/data'
import { VisNestedDonut, VisSingleContainer } from '@unovis/react'
import { NestedDonutSegment } from '@unovis/ts'
import React from 'react'

export const title = 'Basic Nested Donut'
export const subTitle = 'with custom colors'

const data = generateNestedData(100, 3, ['A1', 'B2'])

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  return (
    <VisSingleContainer height={500}>
      <VisNestedDonut
        data={data}
        centralLabel='Central Label'
        centralSubLabel='Sub-label'
        layers={[
          (d: NestedDatum) => d.group,
          (d: NestedDatum) => d.subgroup,
          (d: NestedDatum) => d.value,
        ]}
        showBackground={true}
        segmentColor={(d: NestedDonutSegment<NestedDatum>) => {
          switch (d.data.root) {
            case 'A': return '#cc2211'
            case 'B': return '#22ee33'
            case 'C': return '#2200cc'
          }
        }}
        segmentLabelColor={(d: NestedDonutSegment<NestedDatum>) => {
          if (Number(d.data.key)) return '#ffaa44'
        }}
        duration={props.duration}
      />
    </VisSingleContainer>
  )
}
