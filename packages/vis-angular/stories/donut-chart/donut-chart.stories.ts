// Copyright (c) Volterra, Inc. All rights reserved.
import { moduleMetadata, Story, Meta, componentWrapperDecorator } from '@storybook/angular'
import { VisAngularModule } from 'src/lib.module'
import DonutChartComponent from './donut-chart.component'

export default {
  title: 'XY Charts/XYDonutChartComponent',
  component: DonutChartComponent,
  decorators: [
    moduleMetadata({
      // 👇 Imports both components to allow component composition with Storybook
      declarations: [],
      imports: [VisAngularModule],
    }),
    // 👇 Wraps our stories with a decorator
    componentWrapperDecorator(story => `<div style="margin: 3em">${story}</div>`),
  ],
  argTypes: {},
} as Meta

const Template: Story<DonutChartComponent> = (args: DonutChartComponent) => ({
  props: args,
})

export const Primary = Template.bind({})
Primary.args = {
}
