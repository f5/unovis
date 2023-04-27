/* eslint-disable @typescript-eslint/no-var-requires */
import { TransitionComponent } from '@src/components/TransitionComponent'
import { groupBy } from '@src/utils/array'
import { kebabToTitleCase } from '@src/utils/text'

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
  const category = key.match(/\.\/[\w-]+\/([\w-]+)\//)?.[1] as string

  const exampleItem = {
    ...module,
    category: kebabToTitleCase(category),
  }

  if (module.transitionComponent) {
    exampleItem.title = `${exampleItem.category} Data Transitions`
    exampleItem.subTitle = 'Generated Data'
    exampleItem.component = () => TransitionComponent(module.transitionComponent)
  }
  return exampleItem
})

export const examples: ExampleGroup[] = Object.entries(groupBy(examplesFlat, 'category'))
  .map(([title, items]) => ({ title, items }))

