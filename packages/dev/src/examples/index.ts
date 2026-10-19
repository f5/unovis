/* eslint-disable @typescript-eslint/no-var-requires */
import { TransitionComponent } from '@src/components/TransitionComponent'
import { groupBy } from '@src/utils/array'
import { kebabToTitleCase } from '@src/utils/text'

import { EXAMPLE_SECTION_ORDER } from './constants'

const imports = require.context('@src/examples/', true, /index\.tsx$/)
const allImports = require.context('@src/examples/', true, /\.(tsx?|jsx?|css|json|md)$/)

export type ExampleGroup = {
  title: string;
  items: ExampleItem[];
}

export type ExampleSectionGroup = {
  title: string;
  groups: ExampleGroup[];
}

export type ExampleItem = {
  title: string;
  subTitle: string;
  category: string;
  files: string[];
  component: React.FC;
}

export const examplesFlat: ExampleItem[] = imports.keys().map(key => {
  const module = imports(key)
  const category = key.match(/\.\/[\w-]+\/([\w-]+)\//)?.[1] as string
  const path = key.replace('index.tsx', '')

  const exampleItem = {
    ...module,
    category: kebabToTitleCase(category),
    files: allImports.keys()
      .filter(d => d.includes(path))
      .map(d => d.substring(2))
      .filter(d => d.includes('.')),
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

export const exampleSections: ExampleSectionGroup[] = Object.entries(groupBy(examples.map(group => ({ ...group, section: group.items[0].files[0].split('/')[0] })), 'section'))
  .sort(([a], [b]) => (EXAMPLE_SECTION_ORDER[a] ?? Infinity) - (EXAMPLE_SECTION_ORDER[b] ?? Infinity))
  .map(([title, groups]) => ({ title: kebabToTitleCase(title), groups }))
