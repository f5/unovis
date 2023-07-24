/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/no-var-requires */
import * as React from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'

import { ComponentConfigInterface, SingleContainerConfigInterface, XYComponentConfigInterface, XYContainerConfigInterface } from '@unovis/ts'
import useRouteContext from '@docusaurus/useRouteContext'
import { useLocation } from '@docusaurus/router'
import MDXComponents from '@theme/MDXComponents'

import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import { usePluginData } from '@docusaurus/useGlobalData'
import { SnippetConfigInterface, SnippetContextInput, generateSnippets } from '@site/src/utils/autogen'
import { FrameworkTabs } from '@site/src/components/FrameworkTabs'
import { SnippetConfig } from '@site/src/utils/snippet'


export type DocWrapperProps<T> = SnippetContextInput<T> & {
  name: string;
  data: T;
  className?: string;
  containerName?: string;
  containerProps?: XYContainerConfigInterface<T> | SingleContainerConfigInterface<T>;
  excludeTabs?: boolean;
  excludeChart?: boolean;
  height?: number;
  hiddenProps?: SnippetConfigInterface<T>;
  showFullContext?: boolean;
}


export function DocWrapper<T> (props: DocWrapperProps<T>): JSX.Element {
  const {
    data,
    name,
    className,
    containerName,
    containerProps,
    excludeTabs,
    excludeChart,
    hiddenProps,
    height = 300,
    imports = {},
    declarations = {},
    components = [],
    showFullContext,
    ...rest
  } = props

  const snippetConfig = (): SnippetContextInput<T> => ({
    container: { name: containerName, data: 'data', ...containerProps },
    components: [{ name, ...rest }].concat(components),
    imports: { ...imports, './data': ['data'] },
    declarations,
  })
  return (<>
    {!excludeTabs && <FrameworkTabs {...generateSnippets(data, snippetConfig(), showFullContext ? 'full' : 'compact')}/>}
    {!excludeChart &&
        <BrowserOnly fallback={<div>Loading...</div>}>
          {() => {
            const lib = require('@unovis/react')
            // if (!containerName) {
            //   return (
            //     <>
            //       {components.map((c, i) => {
            //         const { [`Vis${c.name}`]: Component } = lib
            //         const props = c.name === name ? { ...containerConfig, ...c.props, ...hiddenProps } : c.props
            //         return <Component key={`${c.name}-${i}`} {...props}/>
            //       })}
            //     </>
            //   )
            // }
            // const Container = containerName ? lib[`Vis${containerName}`] : React.Fragment
            // console.log(Container, containerConfig, components)
            const Container = lib.VisXYContainer
            const Component = lib.VisLine
            return (
              <Container data={data} height={height}>
                <Component x={d => d.x} y={d => d.y}/>
              </Container>
            )
            // return (
            //   <Container {...containerConfig}>
            //     {components.map(({ name: n, ...p }, i) => {
            //       const { [`Vis${n}`]: Component } = lib
            //       return <Component key={`${n}-${i}`} {...(name === n ? { ...p, ...hiddenProps } : p)}/>
            //     })}
            //   </Container>
            // )
          }}
        </BrowserOnly>
    }
  </>)
}
