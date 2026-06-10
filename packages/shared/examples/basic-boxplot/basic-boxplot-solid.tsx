import { JSX } from 'solid-js'
import { VisAxis, VisBoxplot, VisXYContainer } from '@unovis/solid'

import { data } from './data'

const BasicBoxplot = (): JSX.Element => {
  return (
    <VisXYContainer height='50dvh'>
      <VisBoxplot
        data={data}
        x={(d) => d.x}
        median={(d) => d.median}
        quartiles={(d) => d.quartiles}
        whiskers={(d) => d.whiskers}
      />
      <VisAxis type='x' />
      <VisAxis type='y' />
    </VisXYContainer>
  )
}

export default BasicBoxplot
