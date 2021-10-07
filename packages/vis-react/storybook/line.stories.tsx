// Copyright (c) Volterra, Inc. All rights reserved.
import { Meta, Story } from '@storybook/react'
import { VisXYContainer } from '@volterra/vis-react/containers/xy-container'
import { VisLine, VisLineProps } from '@volterra/vis-react/components/line'

import { TimeDataRecord, generateTimeSeries } from './data/time-series'

const meta: Meta<VisLineProps<TimeDataRecord>> = {
  title: 'Primitives / Line',
  component: VisLine,
  decorators: [story => <VisXYContainer>{story()}</VisXYContainer>],
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const Template: Story<VisLineProps<TimeDataRecord>> = (args) => <VisLine {...args} />

const Basic = Template.bind({})
Basic.args = {
  data: generateTimeSeries(5),
  x: (d: TimeDataRecord) => d.timestamp,
  y: (d: TimeDataRecord) => d.value,
}

export default meta
export { Basic }
