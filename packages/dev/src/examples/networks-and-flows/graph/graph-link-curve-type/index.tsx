import React, { useState } from 'react'
import { VisSingleContainer, VisGraph } from '@unovis/react'
import {
  GraphLayoutType,
  GraphLinkCurveType,
  curveBasis,
  curveBasisClosed,
  curveBasisOpen,
  curveBundle,
  curveCardinal,
  curveCardinalClosed,
  curveCardinalOpen,
  curveCatmullRom,
  curveCatmullRomClosed,
  curveCatmullRomOpen,
  curveLinear,
  curveLinearClosed,
  curveMonotoneX,
  curveMonotoneY,
  curveNatural,
  curveStep,
  curveStepAfter,
  curveStepBefore,
} from '@unovis/ts'
import { generateNodeLinkData } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'ELK Layout: Link Curve Type'
export const subTitle = 'Select Curve Type From Dropdown'

const curveOptions = [
  { label: 'smoothStep', value: GraphLinkCurveType.SmoothStep },
  { label: 'basis', value: curveBasis },
  { label: 'basisClosed', value: curveBasisClosed },
  { label: 'basisOpen', value: curveBasisOpen },
  { label: 'bundle', value: curveBundle },
  { label: 'cardinal', value: curveCardinal },
  { label: 'cardinalClosed', value: curveCardinalClosed },
  { label: 'cardinalOpen', value: curveCardinalOpen },
  { label: 'catmullRom', value: curveCatmullRom },
  { label: 'catmullRomClosed', value: curveCatmullRomClosed },
  { label: 'catmullRomOpen', value: curveCatmullRomOpen },
  { label: 'linear', value: curveLinear },
  { label: 'linearClosed', value: curveLinearClosed },
  { label: 'monotoneX', value: curveMonotoneX },
  { label: 'monotoneY', value: curveMonotoneY },
  { label: 'natural', value: curveNatural },
  { label: 'step', value: curveStep },
  { label: 'stepAfter', value: curveStepAfter },
  { label: 'stepBefore', value: curveStepBefore },
]

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [data] = useState(generateNodeLinkData(20))
  const [curveIndex, setCurveIndex] = useState(0)

  const layoutElkSettings = { 'elk.direction': 'UP' }

  return (
    <>
      <select onChange={e => setCurveIndex(Number(e.target.value))} defaultValue={0}>
        {curveOptions.map((c, i) => <option key={c.label} value={i}>{c.label}</option>)}
      </select>
      <VisSingleContainer data={data} height={900} width={1200}>
        <VisGraph
          layoutType={GraphLayoutType.Elk}
          layoutElkSettings={layoutElkSettings}
          linkCurve={curveOptions[curveIndex].value}
          linkCurvature={1}
          duration={props.duration}
        />
      </VisSingleContainer>
    </>
  )
}
