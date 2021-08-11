// Copyright (c) Volterra, Inc. All rights reserved.
import { moduleMetadata, Story, Meta, componentWrapperDecorator } from '@storybook/angular'
import { VisDonutModule, VisSingleContainerModule } from 'src/public-api'

// Component
import DonutChartComponent from './donut-chart.component'

export default {
  title: 'Experimental/Donut',
  component: DonutChartComponent,
  decorators: [
    moduleMetadata({
      // 👇 Imports both components to allow component composition with Storybook
      declarations: [],
      imports: [VisDonutModule, VisSingleContainerModule],
    }),
    // 👇 Wraps our stories with a decorator
    componentWrapperDecorator(story => `<div style="margin: 3em">${story}</div>`),
  ],
  argTypes: {},
} as Meta

const template: Story<DonutChartComponent> = (args: DonutChartComponent) => ({
  props: args,
})

export const Primary = template.bind({})
Primary.args = {
}
