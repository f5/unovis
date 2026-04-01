import React, { useMemo } from 'react'
import { VisXYContainer, VisLine, VisAxis } from '@unovis/react'
import { XYDataRecord, generateXYDataRecords } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Grid Styling'
export const subTitle = 'Using CSS variables'

const gridHoverCss = `
  .grid-hover-wrapper {
    [axis-type='y'] {
        --vis-axis-grid-opacity: 0;
        --vis-axis-grid-transition: opacity 600ms ease-in-out;
    }
  }
  .grid-hover-wrapper:hover {
    [axis-type='y'] {
      --vis-axis-grid-opacity: 1;
    }
  }
`

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const data = useMemo(() => generateXYDataRecords(25), [])
  const accessors = [
    (d: XYDataRecord) => d.y,
    (d: XYDataRecord) => d.y1,
    (d: XYDataRecord) => d.y2,
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <style>{gridHoverCss}</style>
      <span>Grid lines always visible (default)</span>
      <div>
        <VisXYContainer<XYDataRecord> data={data}>
          <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
          <VisAxis type='x' duration={props.duration} gridLine={true} />
          <VisAxis type='y' duration={props.duration} gridLine={true} />
        </VisXYContainer>
      </div>

      <span>Grid lines disabled</span>
      <div>
        <VisXYContainer<XYDataRecord> data={data}>
          <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
          <VisAxis type='x' duration={props.duration} gridLine={false} />
          <VisAxis type='y' duration={props.duration} gridLine={false} />
        </VisXYContainer>
      </div>

      <span>Custom grid styling   (using CSS variables)</span>
      <div>
        <VisXYContainer<XYDataRecord>
          data={data}
          style={{
            '--vis-axis-grid-color': '#3b82f6',
            '--vis-axis-grid-line-width': '0.5px',
            '--vis-axis-grid-line-dasharray': '8 8',
          }}
        >
          <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
          <VisAxis type='x' duration={props.duration} gridLine={true} />
          <VisAxis type='y' duration={props.duration} gridLine={true} />
        </VisXYContainer>
      </div>

      <span>Y Grid lines visible on hover (using CSS variables)</span>
      <div className="grid-hover-wrapper">
        <VisXYContainer<XYDataRecord> data={data}>
          <VisLine x={d => d.x} y={accessors} duration={props.duration}/>
          <VisAxis type='x' duration={props.duration} gridLine={true} />
          <VisAxis type='y' duration={props.duration} gridLine={true} />
        </VisXYContainer>
      </div>
    </div>
  )
}
