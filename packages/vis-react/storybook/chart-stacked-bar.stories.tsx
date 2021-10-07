// Copyright (c) Volterra, Inc. All rights reserved.
import { Meta, Story } from '@storybook/react'
import { TextAlign } from '@volterra/vis'
import { VisXYContainer, VisXYContainerProps } from '@volterra/vis-react/containers/xy-container'
import { VisStackedBar } from '@volterra/vis-react/components/stacked-bar'
import { VisAxis } from '@volterra/vis-react/components/axis'
import { VisTooltip } from '@volterra/vis-react/components/tooltip'
import { VisCrosshair } from '@volterra/vis-react/components/crosshair'

import { DataRecord, generateDataRecords } from './data/time-series'

const data = generateDataRecords(15)
const accessors = [(d: DataRecord) => d.y, (d: DataRecord) => d.y1, (d: DataRecord) => d.y2]
const meta: Meta<VisXYContainerProps<DataRecord>> = {
  title: 'Full Charts / Stacked Bar Chart',
  component: VisXYContainer,
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const Template: Story<VisXYContainerProps<DataRecord>> = (args) =>
  <VisXYContainer {...args} data={data} margin={{ top: 5, left: 5 }}>
    <VisStackedBar
      x={(d: DataRecord) => d.x}
      y={accessors}
      events={{
        [VisStackedBar.selectors.bar]: {
          // eslint-disable-next-line no-console
          click: (d: DataRecord) => console.log('clicked', d),
          // eslint-disable-next-line no-console
          mouseover: (d: DataRecord) => console.log('hovered', d),
        },
      }}
    />
    <VisAxis type='x' numTicks={5} tickFormat={(x: number) => `${x}ms`} tickTextAlign={TextAlign.Left}/>
    <VisAxis type='y' tickFormat={(y: number) => `${y}bps`}/>
    <VisCrosshair template={(d: DataRecord) => `${d.x}`}/>
    <VisTooltip />
  </VisXYContainer>

const Basic = Template.bind({})
Basic.args = {}

export default meta
export { Basic }
