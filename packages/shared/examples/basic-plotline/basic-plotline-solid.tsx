import { VisAxis, VisLine, VisPlotline, VisXYContainer } from '@unovis/solid'
import { JSX } from 'solid-js'
import { data } from './data'

const BasicPlotlineChart = (): JSX.Element => {
  return (
    <VisXYContainer height='50dvh'>
      <VisLine data={data} x={(d) => d.x} y={(d) => d.y} />
      <VisAxis type='x' />
      <VisAxis type='y' />
      <VisPlotline value={1} color='red'></VisPlotline>
    </VisXYContainer>
  )
}

export default BasicPlotlineChart
