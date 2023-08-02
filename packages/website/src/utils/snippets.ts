/* eslint-disable @typescript-eslint/naming-convention */
import { CodeSnippet, SnippetContext, UiFramework, AngularSnippet, ReactSnippet, SvelteSnippet, TypescriptSnippet } from '../../src/snippets'

import { useDynamicImport } from 'docusaurus-plugin-react-docgen-typescript/pkg/dist-src/hooks/useDynamicImport'
import { FrameworkTabsProps } from '../components/FrameworkTabs'


export type SnippetConfigInterface<T> = { name: string } & T

export type SnippetContextInput<T> = SnippetContext & {
  container?: SnippetConfigInterface<T>;
  components: SnippetConfigInterface<T>[];
  dataTypes?: Record<string, string>;
}

export enum SnippetMode { Full = 'full', Compact = 'compact' }

function getPropTypes (name: string): Record<string, string> {
  return Object.fromEntries(Object.entries(useDynamicImport(`Vis${name}`) ?? {}).map(([k, v]) => [k, v?.type?.name]))
}

function getDataType<T> (data: T[]): string {
  if (!data.length) return '{}'
  return JSON.stringify(Object.fromEntries(Object.keys(data[0]).map(k => [k, typeof data[k]])))
}

export function generateSnippets<T> (data: T, context: SnippetContextInput<T>): Record<SnippetMode, FrameworkTabsProps> {
  const { imports, declarations, container, components, dataTypes } = context

  const config = {
    imports: { ...imports, './data': ['data', ...Object.keys(dataTypes)] },
    declarations,
    components: (container ? [container].concat(components) : components).map(({ name, ...props }, i) => ({
      name,
      isMain: container ? i === 1 : i === 0,
      rawProps: props,
      propTypes: getPropTypes(name),
      isContainer: name.endsWith('Container'),
    })),
    dataType: Object.keys(dataTypes).join(','),
  }

  console.log(config)
  const snippets: Record<UiFramework, CodeSnippet<UiFramework>> = {
    react: new ReactSnippet(config),
    angular: new AngularSnippet(config),
    svelte: new SvelteSnippet(config),
    typescript: new TypescriptSnippet(config),
  }

  function getSnippets (mode: SnippetMode): FrameworkTabsProps {
    return Object.fromEntries(Object.keys(snippets).map(k => [k, snippets[k][mode]]))
  }

  return {
    [SnippetMode.Full]: {
      ...getSnippets(SnippetMode.Full),
      data: `export const data = ${JSON.stringify(data, (k, v) => v, 2)
        .replace(/"\w*":/gm, v => `${v.substr(1, v.length - 3)}:`)}`,
    },
    [SnippetMode.Compact]: getSnippets(SnippetMode.Compact),
  }
}

export function generateXYSnippets<T> (data: T[], ...components: SnippetConfigInterface<T>[]): ReturnType<typeof generateSnippets> {
  return generateSnippets(data, {
    container: { name: 'XYContainer', data: 'data' },
    components,
    dataTypes: {
      DataRecord: getDataType(data),
    },
  })
}

export function generateNodeLinkSnippets<N, L> (data: { nodes: N[]; links: L[]}, ...components: SnippetConfigInterface<T>[]
): ReturnType<typeof generateSnippets> {
  return generateSnippets(data, {
    container: { name: 'SingleContainer', data: 'data' },
    components,
    dataTypes: {
      NodeDatum: getDataType(data.nodes),
      LinkDatum: getDataType(data.links),
    },
  })
}
