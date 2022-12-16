/* eslint-disable @typescript-eslint/no-var-requires */
import { groupBy } from '@src/utils/array'

const imports = require.context('@src/examples/', true, /index\.tsx$/)

export type ExampleGroup = {
  title: string;
  items: ExampleItem[];
}

export type ExampleItem = {
  title: string;
  subTitle: string;
  category: string;
  component: React.FC;
}

export const examplesFlat: ExampleItem[] = imports.keys().map(key => {
  const module = imports(key)
  return {
    title: module.title,
    subTitle: module.subTitle,
    category: module.category,
    component: module.component,
  }
})

export const examples: ExampleGroup[] = Object.entries(groupBy(examplesFlat, 'category'))
  .map(([title, items]) => ({ title, items }))

