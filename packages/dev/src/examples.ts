/* eslint-disable @typescript-eslint/no-var-requires */

export type ExampleGroup = {
  title: string;
  items: ExampleItem[];
}

export type ExampleItem = {
  title: string;
  subTitle: string;
  component: React.FC;
}

export const examples: ExampleGroup[] = [
  {
    title: 'Line',
    items: [
      {
        title: 'Basic Area Chart',
        subTitle: 'Generated data',
        component: require('@src/examples/xy-components/area/basic-area').BasicLine,
      },
    ],
  },
  {
    title: 'Stacked Bar',
    items: [
      {
        title: 'Basic Stacked Bar Chart',
        subTitle: 'Generated data',
        component: require('@src/examples/xy-components/stacked-bar/basic-stacked-bar').BasicStackedBar,
      },
    ],
  },
]
