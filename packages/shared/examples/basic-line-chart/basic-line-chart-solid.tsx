import { JSX } from 'solid-js'
import { VisAxis, VisLine, VisXYContainer } from '@unovis/solid'

import { data } from './data'

const BasicLineChart = (): JSX.Element => {
  return (
    <VisXYContainer height='50dvh'>
      <VisLine data={data} x={(d) => d.x} y={(d) => d.y} />
      <VisAxis type='x' />
      <VisAxis type='y' />
    </VisXYContainer>
  )
}

export default BasicLineChart
