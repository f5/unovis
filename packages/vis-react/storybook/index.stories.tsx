// Copyright (c) Volterra, Inc. All rights reserved.
import { PropsWithChildren } from 'react'
import { Meta, Story } from '@storybook/react'
import { SampleComponent } from './sample-story-component'

const meta: Meta<PropsWithChildren<Record<string, any>>> = {
  title: 'My Component',
  component: SampleComponent,
  argTypes: {
    children: {
      description: 'Content or elements to be rendered inside the Component',
      control: {
        type: 'text',
      },
    },
  },
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const Template: Story<PropsWithChildren<Record<string, any>>> = (args) => <SampleComponent {...args} />

const Basic = Template.bind({})
Basic.args = {
  children: 'Component',
}

export default meta
export { Basic }
