import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'
import { generateNestedData, NestedDatum } from '@/utils/data'
import { VisNestedDonut, VisSingleContainer } from '@unovis/react'
import React from 'react'

export const title = 'Nested Donut Layer Configuration'
export const subTitle = 'with inward/outward direction'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const config = {
    data: generateNestedData(100, 5),
    layers: [
      (d: NestedDatum) => d.group,
      (d: NestedDatum) => d.subgroup,
      (d: NestedDatum) => d.value,
    ],
    layerPadding: 10,
    layerSettings: (i: number) => [
      { width: 100 },
      { width: 50, rotateLabels: true },
      { width: 20 },
    ][i],
  }
  return (<>
    <VisSingleContainer height={500}>
      <VisNestedDonut {...config} direction={'outwards'} duration={props.duration}/>
    </VisSingleContainer>
    <VisSingleContainer height={500}>
      <VisNestedDonut {...config} duration={props.duration}/>
    </VisSingleContainer>
  </>
  )
}
