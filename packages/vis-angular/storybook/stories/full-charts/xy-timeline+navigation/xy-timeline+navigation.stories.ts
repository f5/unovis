// Copyright (c) Volterra, Inc. All rights reserved.
import { moduleMetadata, Story, Meta, componentWrapperDecorator } from '@storybook/angular'
import _sample from 'lodash/sample'
import { bin, extent } from 'd3-array'
import { VisXYContainerModule, VisAxisModule, VisTooltipModule, VisBrushModule, VisTimelineModule, VisStackedBarModule } from 'src/public-api'

// Component
import XyTimelineNavigationComponent from './xy-timeline+navigation.component'
import { TimelineDataRecord, NavigationDataRecord } from './xy-timeline+navigation.types'

export default {
  title: 'Full Charts/Timeline & Navigation',
  component: XyTimelineNavigationComponent,
  decorators: [
    moduleMetadata({
      // 👇 Imports both components to allow component composition with Storybook
      declarations: [],
      imports: [VisXYContainerModule, VisAxisModule, VisTooltipModule, VisBrushModule, VisTimelineModule, VisStackedBarModule],
    }),
    // 👇 Wraps our stories with a decorator
    componentWrapperDecorator(story => `<div style="margin: 3em">${story}</div>`),
  ],
  argTypes: {},
} as Meta

const types = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'Bounded Events': '#C44456',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'Ongoing Events': '#FFCD48',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'Selected Events': '#FF8B01',
}

const timelineData: TimelineDataRecord[] = Array(50).fill(0).map((_, i: number) => ({
  timestamp: Date.now() + (i + 10 * Math.random()) * 1000 * 60 * 60 * 24,
  duration: 1000 * 60 * 60 * (250 * Math.random()),
  kind: _sample(Object.keys(types)),
  name: `Event ${i % 15}`,
  id: `${i}`,
}))

const binGen = bin<TimelineDataRecord, number>()
  .domain(extent(timelineData, d => d.timestamp))
  .value(d => d.timestamp)
  .thresholds(30)

const navigationData = binGen(timelineData).map(d => ({
  id: d.x0.toString(),
  events: d,
  timestamp: (d.x0 + d.x1) / 2,
  value: d.length,
}))

const template: Story<XyTimelineNavigationComponent<TimelineDataRecord, NavigationDataRecord>> = (args: XyTimelineNavigationComponent<TimelineDataRecord, NavigationDataRecord>) => ({
  props: {
    timelineData,
    navigationData,
    itemType: d => d.name,
    itemColor: d => types[d.kind],
    navX: d => d.timestamp,
    navY: d => d.value,
    ...args,
  },
})

export const Primary = template.bind({})
Primary.args = {
  timelineData,
  navigationData,
  itemType: d => d.name,
  itemColor: d => types[d.kind],
  navX: d => d.timestamp,
  navY: d => d.value,
}
