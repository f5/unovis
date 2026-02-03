import React from 'react'
import { VisXYContainer, VisAxis, VisLine, VisGroupedBar } from '@unovis/react'
import { XYDataRecord, generateXYDataRecords } from '@/utils/data'
import { FitMode, TrimMode } from '@unovis/ts'
import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'

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
      <div style={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
        <div>
          <span>Short tick label without fit mode (default)</span>
          <VisXYContainer<XYDataRecord> data={generateXYDataRecords(15)} width={600}>
            <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
            <VisAxis type='x' numTicks={15} tickFormat={(x: number) => `${x}`} duration={props.duration} label='X Label'/>
            <VisAxis type='y' tickFormat={(y: number) => `${y}`} duration={props.duration} label='Y Label' />
          </VisXYContainer>
        </div>
        <div>
          <span>Short labels without fit mode: right, top</span>
          <VisXYContainer<XYDataRecord> data={generateXYDataRecords(15)} width={600}>
            <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
            <VisAxis type='x' numTicks={15} tickFormat={(x: number) => `${x}`} duration={props.duration} label='x Label' position='top' />
            <VisAxis type='y' tickFormat={(y: number) => `${y}`} duration={props.duration} label='When you have a really really long label, you can use the labelTextFitMode to trim/wrap the label' position='right' labelTextTrimType={TrimMode.Middle} />
          </VisXYContainer>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', paddingTop: '50px' }}>
        <div>
          <span>Long tick label with wrap mode: left, top</span>
          <VisXYContainer<XYDataRecord> data={generateXYDataRecords(15)} width={600}>
            <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
            <VisAxis type='x' tickFormat={(x: number) => `${x}-long tick labels`} duration={props.duration} label='When you have a really really long label, you can use the labelTextFitMode to trim/wrap the label' labelTextFitMode={FitMode.Wrap} position='top' />
            <VisAxis type='y' tickFormat={(y: number) => `${y}-long tick labels`} duration={props.duration} label='When you have a really really long label, you can use the labelTextFitMode to trim/wrap the label' labelTextFitMode={FitMode.Wrap} position='left' />
          </VisXYContainer>
        </div>
        <div>
          <span>Long tick label with wrap mode: right, bottom</span>
          <VisXYContainer<XYDataRecord> data={generateXYDataRecords(15)} width={600}>
            <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
            <VisAxis type='x' tickFormat={(x: number) => `${x}-long tick labels`} duration={props.duration} label='When you have a really really long label, you can use the labelTextFitMode to trim/wrap the label' labelTextFitMode={FitMode.Wrap} position='bottom' />
            <VisAxis type='y' tickFormat={(y: number) => `${y}-long tick labels`} duration={props.duration} label='When you have a really really long label, you can use the labelTextFitMode to trim/wrap the label' labelTextFitMode={FitMode.Wrap} position='right' />
          </VisXYContainer>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', paddingTop: '20px' }}>
        <div>
          <span>Short tick label with trim mode: left, bottom</span>
          <VisXYContainer<XYDataRecord> data={generateXYDataRecords(15)} width={600}>
            <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
            <VisAxis type='x' numTicks={15} tickFormat={(x: number) => `${x}`} duration={props.duration} label='When you have a really really long label, you can use the labelTextFitMode to trim/wrap the label' labelTextFitMode={FitMode.Trim} position='bottom' />
            <VisAxis type='y' tickFormat={(y: number) => `${y}`} duration={props.duration} label='When you have a really really long label, you can use the labelTextFitMode to trim/wrap the label' labelTextFitMode={FitMode.Trim} position='left' />
          </VisXYContainer>
        </div>
        <div>
          <span>Short tick label with trim mode: right, top (bigger font)</span>
          <VisXYContainer<XYDataRecord> data={generateXYDataRecords(15)} width={600}>
            <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
            <VisAxis type='x' numTicks={15} tickFormat={(x: number) => `${x}`} duration={props.duration} label='When you have a really really long label, you can use the labelTextFitMode to trim/wrap the label' labelTextFitMode={FitMode.Trim} position='top' labelFontSize={ '18px'} />
            <VisAxis type='y' tickFormat={(y: number) => `${y}`} duration={props.duration} label='When you have a really really long label, you can use the labelTextFitMode to trim/wrap the label' labelTextFitMode={FitMode.Trim} position='right' labelFontSize={'18px'} />
          </VisXYContainer>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', paddingTop: '50px' }}>
        <div>
          <span>Long tick label with trim mode: left, bottom</span>
          <VisXYContainer<XYDataRecord> data={generateXYDataRecords(15)} width={600}>
            <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
            <VisAxis type='x' tickFormat={(x: number) => `${x}-long tick labels`} duration={props.duration} label='When you have a really really long label, you can use the labelTextFitMode to trim/wrap the label' labelTextFitMode={FitMode.Trim} position='bottom' />
            <VisAxis type='y' tickFormat={(y: number) => `${y}-long tick labels`} duration={props.duration} label='When you have a really really long label, you can use the labelTextFitMode to trim/wrap the label' labelTextFitMode={FitMode.Trim} position='left' />
          </VisXYContainer>
        </div>
        <div>
          <span>Long tick label with trim mode: right, top</span>
          <VisXYContainer<XYDataRecord> data={generateXYDataRecords(15)} width={600}>
            <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
            <VisAxis type='x' tickFormat={(x: number) => `${x}-long tick labels`} duration={props.duration} label='When you have a really really long label, you can use the labelTextFitMode to trim/wrap the label' labelTextFitMode={FitMode.Trim} position='top' />
            <VisAxis type='y' tickFormat={(y: number) => `${y}-long tick labels`} duration={props.duration} label='When you have a really really long label, you can use the labelTextFitMode to trim/wrap the label' labelTextFitMode={FitMode.Trim} position='right'/>
          </VisXYContainer>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', paddingTop: '50px' }}>
        <div>
          <span>Bigger font</span>
          <VisXYContainer<XYDataRecord> data={generateXYDataRecords(15)} width={600}>
            <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
            <VisAxis type='x' tickFormat={(x: number) => `${x}-long tick labels`} duration={props.duration} label='When you have a really really long label, you can use the labelTextFitMode to trim/wrap the label' labelTextFitMode={FitMode.Wrap} position='bottom' labelFontSize={'18px'}/>
            <VisAxis type='y' tickFormat={(y: number) => `${y}-long tick labels`} duration={props.duration} label='When you have a really really long label, you can use the labelTextFitMode to trim/wrap the label' labelTextFitMode={FitMode.Wrap} position='left' />
          </VisXYContainer>
        </div>
        <div>
          <span>Color</span>
          <VisXYContainer<XYDataRecord> data={generateXYDataRecords(15)} width={600}>
            <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
            <VisAxis type='x' tickFormat={(x: number) => `${x}-long tick labels`} duration={props.duration} label='When you have a really really long label, you can use the labelTextFitMode to trim/wrap the label' labelTextFitMode={FitMode.Wrap} position='top' />
            <VisAxis type='y' tickFormat={(y: number) => `${y}-long tick labels`} duration={props.duration} label='When you have a really really long label, you can use the labelTextFitMode to trim/wrap the label' labelTextFitMode={FitMode.Wrap} position='right'labelFontSize={'18px'} labelColor={'red'}/>
          </VisXYContainer>
        </div>
      </div>
    </>
  )
}
