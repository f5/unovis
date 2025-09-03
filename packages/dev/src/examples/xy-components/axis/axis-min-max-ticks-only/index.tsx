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

      <code><b>minMaxTicksOnlyShowGridLines: true</b></code>
      <VisXYContainer<XYDataRecord> data={data}>
        <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
        <VisAxis type='x' tickFormat={tickFormatter} duration={props.duration} minMaxTicksOnly={true} minMaxTicksOnlyShowGridLines={true}/>
        <VisAxis type='y' tickFormat={tickFormatter} duration={props.duration} minMaxTicksOnly={true} minMaxTicksOnlyShowGridLines={true}/>
      </VisXYContainer>

      <code><b>minMaxTicksOnlyShowGridLines: true</b><br />
      Custom tickValues for xAxis: [0, 2, 4, 6]. <br />
      No grid line at 10.2, because it's too close to the previous grid line.
      </code>
      <VisXYContainer<XYDataRecord> data={data} yDomain={[0, 10.2]}>
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
