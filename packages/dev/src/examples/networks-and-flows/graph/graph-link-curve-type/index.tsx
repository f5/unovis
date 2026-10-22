import React, { useState } from 'react'
import { VisSingleContainer, VisGraph } from '@unovis/react'
import { CurveType, GraphLayoutType } from '@unovis/ts'
import { generateNodeLinkData } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'ELK Layout: Link Curve Type'
export const subTitle = 'Select Curve Type From Dropdown'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [data] = useState(generateNodeLinkData(20))
  const curveTypes = [...Object.values(CurveType), 'smoothStep']
  const initial = 'smoothStep'
  const [curveType, setCurveType] = useState<string>(initial)

  const layoutElkSettings = { 'elk.direction': 'UP' }

  return (
    <>
      <select onChange={e => setCurveType(e.target.value)} defaultValue={initial}>
        {curveTypes.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <VisSingleContainer data={data} height={900} width={1200}>
        <VisGraph
          layoutType={GraphLayoutType.Elk}
          layoutElkSettings={layoutElkSettings}
          linkCurveType={curveType}
          linkCurvature={1}
          duration={props.duration}
        />
      </VisSingleContainer>
    </>
  )
}
