// Copyright (c) Volterra, Inc. All rights reserved.
import { Meta, Story } from '@storybook/react'
import { VisXYContainer } from '@volterra/vis-react/containers/xy-container'
import { VisScatter, VisScatterProps } from '@volterra/vis-react/components/scatter'

import { TimeDataRecord, generateTimeSeries } from './data/time-series'

const meta: Meta<VisScatterProps<TimeDataRecord>> = {
  title: 'Primitives / Scatter',
  component: VisScatter,
  decorators: [story => <VisXYContainer>{story()}</VisXYContainer>],
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const Template: Story<VisScatterProps<TimeDataRecord>> = (args) => <VisScatter {...args} />

const Basic = Template.bind({})
Basic.args = {
  data: generateTimeSeries(5),
  x: (d: TimeDataRecord) => d.timestamp,
  y: (d: TimeDataRecord) => d.value,
}

export default meta
export { Basic }
