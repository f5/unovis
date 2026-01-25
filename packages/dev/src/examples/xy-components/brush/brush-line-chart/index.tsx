import React, { useState } from 'react'
import { VisXYContainer, VisLine, VisAxis, VisBrush } from '@unovis/react'
import { XYDataRecord, generateXYDataRecords } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Brush & Line Chart'
export const subTitle = 'Using brushHeightExtend'

const data = generateXYDataRecords(50).map((d, i) => ({
  ...d,
  y: i < 15 ? 0 : 15,
}))

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [brushHeightExtend, setBrushHeightExtend] = useState(4)

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <label>
          brushHeightExtend: {brushHeightExtend}
          <input
            type="range"
            min={0}
            max={5}
            step={1}
            value={brushHeightExtend}
            onChange={e => setBrushHeightExtend(Number(e.target.value))}
            style={{ marginLeft: 10, width: 200 }}
          />
        </label>
      </div>
      <VisXYContainer<XYDataRecord> data={data} height={300} clipPathExtend={4}>
        <VisLine<XYDataRecord> x={d => d.x} y={d => d.y} duration={props.duration} lineWidth={8}/>
        <VisBrush
          draggable={true}
          duration={0}
          brushHeightExtend={brushHeightExtend}
        />
        <VisAxis type='x' tickTextHideOverlapping={true} duration={props.duration} />
        <VisAxis type='y' duration={props.duration} />
      </VisXYContainer>
    </div>
  )
}
