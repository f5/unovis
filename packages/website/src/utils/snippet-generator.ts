import {
  LineConfigInterface,
  ScatterConfigInterface,
  BrushConfigInterface,
  TimelineConfigInterface,
  AreaConfigInterface,
  StackedBarConfigInterface,
} from '@unovis/ts'

import { parseProps } from '@site/docs/utils/parser'
import { DocComponent } from '@site/docs/wrappers/types'
import { getAngularStrings, getReactStrings, getSvelteStrings, getTypescriptStrings } from '@site/docs/utils/code'
import { CodeSnippetProps } from '../components/CodeSnippet'
import { Framework } from '../types/code'

import { useDynamicImport } from 'docusaurus-plugin-react-docgen-typescript/pkg/dist-src/hooks/useDynamicImport'

export function generateSnippets<T> (data: T, components: DocComponent[], container?: DocComponent): CodeSnippetProps {
  const declarations = { data: 'data' }
  const config = {
    container: parseProps(container, ['data'], declarations),
    components: components.map(c => parseProps(c, [], declarations)),
    declarations,
    dataType: 'Datum',
    imports: { './data': ['data', 'Datum'] },
    visImports: [container].concat(components).map(c => `Vis${c.name}`),
  }
  return {
    react: getReactStrings(config),
    angular: getAngularStrings(config, ['data']),
    svelte: getSvelteStrings(config),
    typescript: getTypescriptStrings(config),
    data: `export const data = ${JSON.stringify(data, (k, v) => v, 2)
      .replace(/"\w*":/gm, v => `${v.substr(1, v.length - 3)}:`
      )}`,
  }
}

export type XYComponentSnippetConfigInterface<Datum> = { name: 'string' } & (StackedBarConfigInterface<Datum>
| LineConfigInterface<Datum>
| ScatterConfigInterface<Datum>
| BrushConfigInterface<Datum>
| TimelineConfigInterface<Datum>
| AreaConfigInterface<Datum>)


export function generateXYSnippets<T> (data: T, components: XYComponentSnippetConfigInterface<T>[]): CodeSnippetProps {
  const propTypes = components.map(c => useDynamicImport(`Vis${c.name}`))
  // console.log(propTypes)
  return generateSnippets<T>(data,
    components.map(({ name, ...props }) => ({ name, props })),
    { name: 'XYContainer', props: { data } }
  )
}
