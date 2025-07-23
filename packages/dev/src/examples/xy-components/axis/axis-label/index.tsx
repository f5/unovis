import React from 'react'
import { VisXYContainer, VisAxis, VisLine, VisGroupedBar } from '@unovis/react'
import { XYDataRecord, generateXYDataRecords } from '@src/utils/data'
import { FitMode, TrimMode } from '@unovis/ts'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Axis with Label Text Fit Mode'
export const subTitle = 'Trim and Wrap'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const accessors = [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
    () => Math.random(),
    () => Math.random(),
  ]
  return (
    <>
      <VisXYContainer<XYDataRecord> data={generateXYDataRecords(15)} width={600}>
        <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
        <VisAxis type='x' numTicks={15} tickFormat={(x: number) => `${x}`} duration={props.duration} label='S little longer X Axis X Axis supe r super suepra lskdjgaljgal fjglaijhlaidaij ijsdjflak  sladkjfalfgjlfijg jhglijhlij' labelTextFitMode={FitMode.Trim} position='bottom' />
        <VisAxis type='y' tickFormat={(y: number) => `${y}`} duration={props.duration} label='X Axis Xasdlfkjalsgjl alskdjfla sjgliajflijg alskdjflsajgldgjfldgj' labelTextFitMode={FitMode.Wrap} position='left' labelTextTrimType={TrimMode.Start} />
      </VisXYContainer>

      <VisXYContainer<XYDataRecord> data={generateXYDataRecords(15)} width={600}>
        <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
        <VisAxis type='x' numTicks={15} tickFormat={(x: number) => `${x}`} duration={props.duration} label='S little longer X Axis X Axis supe r super suepra lskdjgaljgal fjglaijhlaidaij ijsdjflak  sladkjfalfgjlfijg jhglijhlij' labelTextFitMode={FitMode.Wrap} position='bottom' />
        <VisAxis type='y' tickFormat={(y: number) => `${y}`} duration={props.duration} label='X Axis Xasdlfkjalsgjl alskdjfla sjgliajflijg alskdjflsajgldgjfldgj' labelTextFitMode={FitMode.Wrap} position='right' labelTextTrimType={TrimMode.Middle} />
      </VisXYContainer>

      <VisXYContainer<XYDataRecord> data={generateXYDataRecords(15)} width={600}>
        <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
        <VisAxis type='x' numTicks={15} tickFormat={(x: number) => `${x}`} duration={props.duration} label='S little longer X Axis X Axis supe r super suepra lskdjgaljgal fjglaijhlaidaij ijsdjflak  sladkjfalfgjlfijg jhglijhlij' labelTextFitMode={FitMode.Wrap} position='top' labelFontSize={ '18px'} />
        <VisAxis type='y' tickFormat={(y: number) => `${y}`} duration={props.duration} label='X Axis Xasdlfkjalsgjl alskdjfla sjgliajflijg alskdjflsajgldgjfldgj' labelTextFitMode={FitMode.Trim} position='right' labelColor={'red'} labelFontSize={'18px'} />
      </VisXYContainer>
    </>
  )
}
