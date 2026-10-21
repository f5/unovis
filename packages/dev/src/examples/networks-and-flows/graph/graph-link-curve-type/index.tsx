import React, { useState } from 'react'
import { VisSingleContainer, VisGraph } from '@unovis/react'
import { CurveType, GraphLayoutType } from '@unovis/ts'
import { generateNodeLinkData } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Dagre Layout: Link Curve Type'
export const subTitle = 'Select Curve Type From Dropdown'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [data] = useState(generateNodeLinkData(20))
  const curveTypes = Object.values(CurveType)
  const initial = CurveType.MonotoneX
  const [curveType, setCurveType] = useState<string>(initial)

  const dagreLayoutSettings = { rankdir: 'TB' }

  return (
    <>
      <select onChange={e => setCurveType(e.target.value)} defaultValue={initial}>
        {curveTypes.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <VisSingleContainer data={data} height={900}>
        <VisGraph
          layoutType={GraphLayoutType.Dagre}
          dagreLayoutSettings={dagreLayoutSettings}
          linkCurveType={curveType}
          linkCurvature={1}
          duration={props.duration}
        />
      </VisSingleContainer>
    </>
  )
}
