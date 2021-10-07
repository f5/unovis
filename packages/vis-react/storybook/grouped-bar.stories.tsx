// Copyright (c) Volterra, Inc. All rights reserved.
import { Meta, Story } from '@storybook/react'
import { VisXYContainer } from '@volterra/vis-react/containers/xy-container'
import { VisGroupedBar, VisGroupedBarProps } from '@volterra/vis-react/components/grouped-bar'

import { DataRecord, generateDataRecords } from './data/time-series'

const meta: Meta<VisGroupedBarProps<DataRecord>> = {
  title: 'Primitives / Grouped Bar',
  component: VisGroupedBar,
  decorators: [story => <VisXYContainer>{story()}</VisXYContainer>],
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const Template: Story<VisGroupedBarProps<DataRecord>> = (args) => <VisGroupedBar {...args} />

const Basic = Template.bind({})
Basic.args = {
  x: (d: DataRecord) => d.x,
  y: [(d: DataRecord) => d.y, (d: DataRecord) => d.y1, (d: DataRecord) => d.y2],
  data: generateDataRecords(15),
}

export default meta
export { Basic }
