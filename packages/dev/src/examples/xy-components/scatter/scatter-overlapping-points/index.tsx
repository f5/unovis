import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Scatter } from '@unovis/ts'
import { VisXYContainer, VisScatter, VisAxis } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

const NUM_POINTS = 20000

type Datum = { x: number; y: number }

function generateData (seed = 7): Datum[] {
  let s = seed
  const random = (): number => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }

  // A telemetry-like series: far more points than the chart has pixels, so most of the markers end
  // up drawn on top of one another
  return Array.from({ length: NUM_POINTS }, (_, i) => ({
    x: i,
    y: 50 + 30 * Math.sin(i / 700) + 4 * Math.sin(i / 37) + 0.6 * (random() - 0.5),
  }))
}

export const title = 'Overlapping Point Culling'
export const subTitle = `${NUM_POINTS.toLocaleString()} points, one marker per pixel`

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [cullOverlappingPoints, setCullOverlappingPoints] = useState(true)
  const data = useMemo(() => generateData(), [])

  const [renderedPoints, setRenderedPoints] = useState(NUM_POINTS)
  const countTimeoutRef = useRef<number>()

  // Culled points leave through an exit transition, so the DOM only holds the final count once it
  // has finished — counting on `onRenderComplete` alone reports the pre-removal number
  const countPoints = useCallback((svg: SVGSVGElement) => {
    window.clearTimeout(countTimeoutRef.current)
    countTimeoutRef.current = window.setTimeout(() => {
      setRenderedPoints(svg.querySelectorAll(`.${Scatter.selectors.point}`).length)
    }, (props.duration ?? 0) + 50)
  }, [props.duration])

  useEffect(() => () => window.clearTimeout(countTimeoutRef.current), [])

  return (
    <>
      <div style={{ marginBottom: 10 }}>
        <label>
          <input
            type='checkbox'
            checked={cullOverlappingPoints}
            onChange={e => setCullOverlappingPoints(e.target.checked)}
          /> <code>cullOverlappingPoints</code>
        </label>
        <span style={{ marginLeft: 12 }}>
          rendering <strong>{renderedPoints.toLocaleString()}</strong> of {NUM_POINTS.toLocaleString()} markers
        </span>
      </div>
      <VisXYContainer<Datum>
        data={data}
        margin={{ top: 5, left: 5 }}
        onRenderComplete={countPoints}
      >
        <VisScatter<Datum>
          x={d => d.x}
          y={d => d.y}
          size={4}
          cullOverlappingPoints={cullOverlappingPoints}
          duration={props.duration}
        />
        <VisAxis type='x' duration={props.duration}/>
        <VisAxis type='y' duration={props.duration}/>
      </VisXYContainer>
    </>
  )
}
