import { JSX } from 'solid-js'
import { VisArea, VisAxis, VisLine, VisXYContainer } from '@unovis/solid'
import { Position } from '@unovis/ts'

import { XYDataRecord, generateXYDataRecords } from './data'

const DualAxisChart = (): JSX.Element => {
  const margin = { left: 100, right: 100, top: 40, bottom: 60 }
  const style: JSX.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '40vh',
  }

  const chartX = (d: XYDataRecord) => d.x
  const chartAY = (d: XYDataRecord, i: number) => i * (d.y || 0)
  const chartBY = (d: XYDataRecord) => 20 + 10 * (d.y2 || 0)
  const xTicks = (x: number) => `${x}ms`
  const chartAYTicks = (y: number) => `${y}bps`
  const chartBYTicks = (y: number) => `${y}db`

  return (
    <div>
      <VisXYContainer
        data={generateXYDataRecords(150)}
        margin={margin}
        height='40dvh'
        width='100%'
        autoMargin={false}
      >
        <VisArea x={chartX} y={chartAY} opacity={0.9} />
        <VisAxis type='x' numTicks={3} tickFormat={xTicks} label='Time' />
        <VisAxis
          type='y'
          tickFormat={chartAYTicks}
          tickTextWidth={60}
          tickTextColor='#4D8CFD'
          labelColor='#4D8CFD'
          label='Traffic'
        />
      </VisXYContainer>
      <VisXYContainer
        data={generateXYDataRecords(150)}
        yDomain={[0, 100]}
        margin={margin}
        autoMargin={false}
        style={style}
      >
        <VisLine x={chartX} y={chartBY} color='#FF6B7E' />
        <VisAxis
          type='y'
          position={Position.Right}
          tickFormat={chartBYTicks}
          gridLine={false}
          tickTextColor='#FF6B7E'
          labelColor='#FF6B7E'
          label='Signal Strength'
        />
      </VisXYContainer>
    </div>
  )
}

export default DualAxisChart
