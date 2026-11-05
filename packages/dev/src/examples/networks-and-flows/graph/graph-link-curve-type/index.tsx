import React, { useMemo, useState } from 'react'
import { VisSingleContainer } from '@unovis/react/containers/single-container'
import { VisGraph } from '@unovis/react/components/graph'
import { GraphLayoutType, GraphLinkArrowStyle } from '@unovis/ts/components/graph/types'
import { curveSmoothStep, SmoothStepDirection } from '@unovis/ts/utils/curves/smooth-step'
import { generateNodeLinkData } from '@src/utils/data'
import type { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

import { CURVE_OPTIONS, DIRECTIONS } from './constants'

export const title = 'ELK Layout: Link Curve Type'
export const subTitle = 'D3 curve factories with configurable smooth-step routing'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [data] = useState(generateNodeLinkData(20))
  const [curveIndex, setCurveIndex] = useState(0)
  const [direction, setDirection] = useState<SmoothStepDirection>(SmoothStepDirection.Up)
  const [layoutDirection, setLayoutDirection] = useState(SmoothStepDirection.Up)
  const [radius, setRadius] = useState(5)
  const [offset, setOffset] = useState(20)
  const smoothStep = useMemo(() => curveSmoothStep.radius(radius).offset(offset).direction(direction), [radius, offset, direction])
  const layoutElkSettings = useMemo(() => ({ 'elk.direction': layoutDirection.toUpperCase() }), [layoutDirection])

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <label>
          Curve: {' '}
          <select aria-label="Curve" value={curveIndex} onChange={e => setCurveIndex(Number(e.target.value))}>
            {CURVE_OPTIONS.map((option, i) => <option key={option.label} value={i}>{option.label}</option>)}
          </select>
        </label>
        <label>
          Direction: {' '}
          <select aria-label="Direction" value={direction} onChange={e => {
            const value = e.target.value as SmoothStepDirection
            setDirection(value)
            if (value !== SmoothStepDirection.Auto) setLayoutDirection(value)
          }}>
            {DIRECTIONS.map(value => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label>
          Radius: {' '}
          <input aria-label="Radius" type="number" min={0} max={50} value={radius} disabled={curveIndex !== 0}
            style={{ width: 64 }} onChange={e => setRadius(Math.max(0, Number(e.target.value)))} />
        </label>
        <label>
          Offset: {' '}
          <input aria-label="Offset" type="number" min={0} max={100} value={offset} disabled={curveIndex !== 0}
            style={{ width: 64 }} onChange={e => setOffset(Math.max(0, Number(e.target.value)))} />
        </label>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, width: '100%' }}>
        {[
          { label: 'Default Bezier', curve: undefined },
          { label: CURVE_OPTIONS[curveIndex].label, curve: curveIndex === 0 ? smoothStep : CURVE_OPTIONS[curveIndex].value },
        ].map(({ label, curve }, i) => (
          <section key={i} style={{ flex: '1 1 400px', minWidth: 0 }}>
            <h3>{label}</h3>
            <VisSingleContainer data={data} height={700}>
              <VisGraph
                layoutType={GraphLayoutType.Elk}
                layoutElkSettings={layoutElkSettings}
                linkCurve={curve}
                linkCurvature={1}
                linkWidth={2}
                linkStroke="var(--vis-color-main)"
                linkArrow={GraphLinkArrowStyle.Single}
                duration={props.duration}
              />
            </VisSingleContainer>
          </section>
        ))}
      </div>
    </>
  )
}
