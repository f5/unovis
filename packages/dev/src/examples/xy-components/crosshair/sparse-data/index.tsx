import React, { useRef } from 'react'
import { VisXYContainer, VisLine, VisAxis, VisTooltip, VisCrosshair } from '@unovis/react'

import { randomNumberGenerator } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Crosshair with Sparse Data'
export const subTitle = 'Line chart with many null values'

type SparseDataRecord = {
  x: number;
  y: number | null;
  y1: number | null;
  y2: number | null;
}

function generateSparseData (n: number): SparseDataRecord[] {
  return Array(n).fill(0).map((_, i) => ({
    x: i,
    y: randomNumberGenerator() < 0.6 ? null : 5 + 5 * randomNumberGenerator(),
    y1: randomNumberGenerator() < 0.5 ? null : 1 + 3 * randomNumberGenerator(),
    y2: randomNumberGenerator() < 0.7 ? null : 2 + 2 * randomNumberGenerator(),
  }))
}

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const tooltipRef = useRef(null)
  const data = generateSparseData(50)
  const accessors = [
    (d: SparseDataRecord) => d.y,
    (d: SparseDataRecord) => d.y1,
    (d: SparseDataRecord) => d.y2,
  ]

  const template = (d: SparseDataRecord, x: number | Date): string => {
    const rows = accessors.map((accessor, i) => {
      const v = accessor(d)
      return `<div>y${i || ''}: ${v == null ? '—' : v.toFixed(2)}</div>`
    }).join('')
    return `<div style="font-size: 12px;"><strong>x: ${x}</strong>${rows}</div>`
  }

  return (
    <VisXYContainer<SparseDataRecord> data={data} margin={{ top: 5, left: 5 }} height={400} yDomain={[0, undefined]}>
      <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
      <VisAxis type='x' duration={props.duration}/>
      <VisAxis type='y' duration={props.duration}/>
      <VisCrosshair<SparseDataRecord> template={template}/>
      <VisTooltip ref={tooltipRef} container={document.body}/>
    </VisXYContainer>
  )
}
