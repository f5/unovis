import type { SnippetContext } from '@site/src/snippets'
import { AngularSnippet, ReactSnippet, SvelteSnippet, TypescriptSnippet } from '@site/src/snippets'

import { useDynamicImport } from 'docusaurus-plugin-react-docgen-typescript/pkg/dist-src/hooks/useDynamicImport'
// import { SnippetContext, PropItem, AngularSnippet, SvelteSnippet, TypescriptSnippet } from './snippet'
import { FrameworkTabsProps } from '../components/FrameworkTabs'

export type SnippetConfigInterface<T> = { name: string } & T

export type SnippetContextInput<T> = SnippetContext & {
  container?: SnippetConfigInterface<T>;
  components: SnippetConfigInterface<T>[];
  dataType?: string;
}

function getPropTypes (name: string): Record<string, string> {
  return Object.fromEntries(Object.entries(useDynamicImport(`Vis${name}`) ?? {}).map(([k, v]) => [k, v?.type?.name]))
}

export function generateSnippets<T> (data: T, context: SnippetContextInput<T>, mode: 'compact' | 'full'): FrameworkTabsProps {
  const { imports, declarations, container, components } = context

  const config = {
    imports,
    declarations,
    components: (container ? [container].concat(components) : components).map(({ name, ...props }) => ({
      name,
      props,
      propTypes: getPropTypes(name),
      isContainer: name.endsWith('Container'),
    })),
  }

  return {
    react: new ReactSnippet(config)[mode],
    angular: new AngularSnippet(config)[mode],
    svelte: new SvelteSnippet(config)[mode],
    typescript: new TypescriptSnippet(config).full,
    data: `export const data = ${JSON.stringify(data, (k, v) => v, 2)
      .replace(/"\w*":/gm, v => `${v.substr(1, v.length - 3)}:`)}`,
  }
}
