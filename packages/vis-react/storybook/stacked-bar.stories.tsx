// Copyright (c) Volterra, Inc. All rights reserved.
import { Meta, Story } from '@storybook/react'
import { VisXYContainer } from '@volterra/vis-react/containers/xy-container'
import { VisStackedBar, VisStackedBarProps } from '@volterra/vis-react/components/stacked-bar'

import { DataRecord, generateDataRecords } from './data/time-series'

const meta: Meta<VisStackedBarProps<DataRecord>> = {
  title: 'Primitives / Stacked Bar',
  component: VisStackedBar,
  decorators: [story => <VisXYContainer>{story()}</VisXYContainer>],
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const Template: Story<VisStackedBarProps<DataRecord>> = (args) => <VisStackedBar {...args} />

const Basic = Template.bind({})
Basic.args = {
  x: (d: DataRecord) => d.x,
  y: [(d: DataRecord) => d.y, (d: DataRecord) => d.y1, (d: DataRecord) => d.y2],
  data: generateDataRecords(15),
}

export default meta
export { Basic }
