import React, { useCallback, useMemo } from 'react'
import { VisXYContainer, VisAxis, VisLine } from '@unovis/react'
import { XYDataRecord, generateXYDataRecords } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Axis Min-Max Ticks Only'
export const subTitle = 'Show Grid Lines'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const accessors = useMemo(() => [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
  ], [])

  const data = useMemo(() => generateXYDataRecords(15), [])

  const tickFormatter = useCallback((tick: number | Date) => `${(+tick).toFixed(1)}`, [])
  return (
    <>
      <code>Default: No Grid Lines</code>
      <VisXYContainer<XYDataRecord> data={data}>
        <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
        <VisAxis type='x' tickFormat={tickFormatter} duration={props.duration} minMaxTicksOnly={true} />
        <VisAxis type='y' tickFormat={tickFormatter} duration={props.duration} minMaxTicksOnly={true} />
      </VisXYContainer>

      <code>minMaxTicksOnlyShowGridLines: true</code>
      <VisXYContainer<XYDataRecord> data={data}>
        <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
        <VisAxis type='x' tickFormat={tickFormatter} duration={props.duration} minMaxTicksOnly={true} minMaxTicksOnlyShowGridLines={true}/>
        <VisAxis type='y' tickFormat={tickFormatter} duration={props.duration} minMaxTicksOnly={true} minMaxTicksOnlyShowGridLines={true}/>
      </VisXYContainer>

      <code>minMaxTicksOnlyShowGridLines: true. Custom `tickValues` for xAxis: [0, 2, 4, 6]</code>
      <VisXYContainer<XYDataRecord> data={data}>
        <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
        <VisAxis
          type='x'
          tickFormat={tickFormatter}
          duration={props.duration}
          minMaxTicksOnly={true}
          minMaxTicksOnlyShowGridLines={true}
          tickValues={[0, 2, 4, 6]}
        />
        <VisAxis type='y' tickFormat={tickFormatter} duration={props.duration} minMaxTicksOnly={true} minMaxTicksOnlyShowGridLines={true}/>
      </VisXYContainer>
    </>
  )
}
