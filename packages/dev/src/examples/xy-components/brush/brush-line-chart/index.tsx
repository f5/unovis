import { ExampleControls } from '@src/components/ExampleControls'
import { useComponentState } from '@src/components/ExampleControls/useComponentState'
import React from 'react'
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
  const [brushHeightExtend, setBrushHeightExtend] = useComponentState('brush', 'brushHeightExtend', 4)

  return (
    <div>
      <ExampleControls components={['brush']}/>
      <div style={{ marginBottom: 10 }}>
        <label>
          brushHeightExtend: {brushHeightExtend}
          <input
            type="range"
            min={Math.min(0, brushHeightExtend ?? 0)}
            max={Math.max(5, brushHeightExtend ?? 5)}
            step={Number.isInteger(brushHeightExtend) ? 1 : 'any'}

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
