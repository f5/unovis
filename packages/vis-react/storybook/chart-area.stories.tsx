// Copyright (c) Volterra, Inc. All rights reserved.
import { Meta, Story } from '@storybook/react'
import { TextAlign } from '@volterra/vis'
import { VisXYContainer, VisXYContainerProps } from '@volterra/vis-react/containers/xy-container'
import { VisArea } from '@volterra/vis-react/components/area'
import { VisAxis } from '@volterra/vis-react/components/axis'
import { VisCrosshair } from '@volterra/vis-react/components/crosshair'
import { VisTooltip } from '@volterra/vis-react/components/tooltip'

import { DataRecord, generateDataRecords } from './data/time-series'

const data = generateDataRecords(15)

const meta: Meta<VisXYContainerProps<DataRecord>> = {
  title: 'Full Charts / Area Chart',
  component: VisXYContainer,
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const Template: Story<VisXYContainerProps<DataRecord>> = (args) =>
  <VisXYContainer {...args} data={data} margin={{ top: 5, left: 5 }}>
    <VisArea
      x={(d: DataRecord) => d.x}
      y={(d: DataRecord) => d.y}
      events={{
        [VisArea.selectors.area]: {
          // eslint-disable-next-line no-console
          click: (data: DataRecord[]) => console.log('clicked', data),
          // eslint-disable-next-line no-console
          mouseover: (data: DataRecord[]) => console.log('hovered', data),
        },
      }}
    />
    <VisAxis type='x' numTicks={5} tickFormat={(x: number) => `${x}ms`} tickTextAlign={TextAlign.Left}/>
    <VisAxis type='y' tickFormat={(y: number) => `${y}bps`}/>
    <VisTooltip />
    <VisCrosshair template={(d: DataRecord) => `${d.x}, ${d.y.toFixed(2)}`}/>
  </VisXYContainer>

const Basic = Template.bind({})
Basic.args = {}

export default meta
export { Basic }
