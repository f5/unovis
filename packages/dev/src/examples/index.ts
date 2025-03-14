import { TransitionComponent } from '@/components/TransitionComponent'
import { groupBy } from '@/utils/array'
import { kebabToTitleCase } from '@/utils/text'

const imports = import.meta.glob('@/examples/**/index.tsx', { eager: true })

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

export const examplesFlat: ExampleItem[] = Object.entries(imports).map(([key, module]) => {
  const category = key.match(/\/([\w-]+)\/index\.tsx$/)?.[1] as string

  const exampleItem: ExampleItem = {
    ...module as any,
    category: kebabToTitleCase(category),
    title: `${kebabToTitleCase(category)} Example`,
    subTitle: 'Generated Example',
    component: module?.component as React.FC || (() => null), // Ensure default export is used
  }

  if ((module as any)?.transitionComponent) {
    exampleItem.title = `${exampleItem.category} Data Transitions`
    exampleItem.subTitle = 'Generated Data'
    exampleItem.component = () => TransitionComponent((module as any).transitionComponent)
  }

  return exampleItem
})

// Group by category
export const examples: ExampleGroup[] = Object.entries(groupBy(examplesFlat, 'category'))
  .map(([title, items]) => ({ title, items }))
