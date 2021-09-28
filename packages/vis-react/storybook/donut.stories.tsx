// Copyright (c) Volterra, Inc. All rights reserved.
import { Meta, Story } from '@storybook/react'
import { VisDonut, VisDonutProps } from '../src/components/donut'
import { VisSingleContainer } from '../src/containers/single-container'

type DonutDatum = { value: number }

const meta: Meta<VisDonutProps<DonutDatum>> = {
  title: 'Donut',
  component: VisDonut,
  decorators: [story => <VisSingleContainer>{story()}</VisSingleContainer>],
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const Template: Story<VisDonutProps<DonutDatum>> = (args) => <VisDonut {...args} />

const Basic = Template.bind({})
Basic.args = {
  data: Array(2).fill(0).map(() => ({ value: Math.random() })),
  value: (d: DonutDatum): number => d.value,
  arcWidth: 55,
  centralLabel: '4K',
}

export default meta
export { Basic }
