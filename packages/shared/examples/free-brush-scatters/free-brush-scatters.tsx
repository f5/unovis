import React, { useCallback, useState } from 'react'
import { FreeBrushMode, Scale, Position } from '@unovis/ts'
import { VisXYContainer, VisScatter, VisAxis, VisBulletLegend, VisFreeBrush } from '@unovis/react'
import { palette, data, DataRecord } from './data'

const categories = [...new Set(data.map((d: DataRecord) => d.category))].sort()
const colorScale = Scale.scaleOrdinal(palette).domain(categories)
const formatNumber = Intl.NumberFormat('en', { notation: 'compact' }).format

export default function FreeBrushScatter (): JSX.Element {
  const legendItems = categories.map(v => ({ name: v, color: colorScale(v) }))
  const [selection, setSelection] = useState(null)

  const scatterProps = {
    x: useCallback((d: DataRecord) => d.medianSalary, []),
    y: useCallback((d: DataRecord) => d.employmentRate, []),
    color: useCallback((d: DataRecord) => colorScale(d.category), []),
    size: useCallback((d: DataRecord) => d.total, []),
    label: useCallback((d: DataRecord) => d.major, []),
    id: useCallback((d: DataRecord) => d.major, []),
  }

  return (
    <>
      <h2>American College Graduates, 2010-2012</h2>
      <VisBulletLegend items={legendItems} />
      <VisXYContainer className="minimap" data={data} height={125}>
        <VisScatter {...scatterProps} sizeRange={[3, 10]} label={undefined}/>
        <VisFreeBrush
          selectionMinLength={[0, 0]}
          autoHide={false}
          onBrushEnd={useCallback(setSelection, [])}
          mode={FreeBrushMode.XY}/>
      </VisXYContainer>
      <VisXYContainer
        data={data}
        xDomain={selection?.[0]}
        yDomain={selection?.[1]}
        height={'55vh'}
        scaleByDomain={true}
      >
        <VisScatter {...scatterProps} sizeRange={[20, 80]} labelPosition={Position.Bottom} />
        <VisAxis type='x' label='Median Salary ($)' tickFormat={formatNumber} gridLine={false}/>
        <VisAxis type='y' label='Employment Rate' tickPadding={0} gridLine={false}/>
      </VisXYContainer>
    </>
  )
}
