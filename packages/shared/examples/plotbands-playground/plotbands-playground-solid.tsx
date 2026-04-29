import { VisAxis, VisLine, VisPlotband, VisXYContainer } from '@unovis/solid'
import { JSX } from 'solid-js'
import { data } from './data'

const PlotbandsPlayground = (): JSX.Element => {
  return (
    <VisXYContainer height={600}>
      <VisLine data={data} x={d => d.x} y={d => d.y} />
      <VisAxis type='x' />
      <VisAxis type='y' />
      <VisPlotband from={4} to={6} labelText='Plot band on x-axis' axis='x' labelPosition='top-inside' />
      <VisPlotband from={1} to={3} color='rgba(34, 99, 182, 0.3)' labelText='Plot band on y-axis' labelPosition='left-inside' />
    </VisXYContainer>
  )
}

export default PlotbandsPlayground
