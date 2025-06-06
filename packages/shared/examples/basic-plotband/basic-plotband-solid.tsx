import { VisAxis, VisLine, VisPlotband, VisXYContainer } from '@unovis/solid'
import { JSX } from 'solid-js'
import { data } from './data'


const PlotbandChart = (): JSX.Element => {
  return (
    <VisXYContainer height={600}>
      <VisLine data={data} x={d => d.x} y={d => d.y} />
      <VisAxis type='x' />
      <VisAxis type='y' />
      <VisPlotband from={3} to={5} labelText='Plot Band' />
    </VisXYContainer>
  )
}

export default PlotbandChart
