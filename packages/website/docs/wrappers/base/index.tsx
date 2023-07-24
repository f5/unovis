/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/no-var-requires */
import * as React from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'
import { SingleContainerConfigInterface, XYComponentConfigInterface } from '@unovis/ts'
import { FrameworkTabs } from '@site/src/components/FrameworkTabs'
import { generateSnippets, SnippetContextInput } from '@site/src/utils/autogen'

export type DocWrapperProps<T> = SnippetContextInput<T> & {
  name: string;
  data: T;
  excludeTabs: boolean;
  excludeChart: boolean;
  hideTabLabels: boolean;
}

/* XYWrapper by default displays code snippet tabs and a Vis component with custom props */
export function DocWrapper ({
  data,
  name,
  className,
  containerName,
  containerProps,
  height = 300,
  hideTabLabels,
  showContext,
  excludeTabs,
  excludeGraph,
  hiddenProps,
  components = [],
  imports = {},
  declarations = {},
  ...rest
}: DocWrapperProps): JSX.Element {
  const [snippetProps, setSnippetProps] = React.useState()
  React.useEffect(() => {
    // const snippetConfig = {
    //   container: { name: containerName, props: { ...containerProps } },
    //   components: name !== containerName && showContext ? [{ name, ...rest }, components] : components,
    //   imports,
    //   declarations,
    // }
    // if (!excludeTabs) {
    //   setSnippetProps(
    //     generateSnippets(data, snippetConfig, 'compact')
    //   )
    // }
  }, [])
  // if (data) {
  //   if (!container) {
  //     rest.data = data
  //   } else {
  //     container.props.data = data
  //   }
  // }
  // components = container && container.name !== name ? [...components, { name, ...rest }] : components
  components = name !== containerName ? [{ name, ...rest }].concat(components) : components
  // const containerName = container.name
  // const containerProps = { ...container.props, data }
  return (
    <>
      {!excludeTabs &&
        <FrameworkTabs {...generateSnippets(data, {
          imports,
          declarations,
          components,
          container: containerName && { name: containerName, ...containerProps },
        }, showContext === 'full' ? 'full' : 'compact')}/>}
      {!excludeGraph &&
        <BrowserOnly fallback={<div>Loading...</div>}>
          {() => {
            const containerConfig = {
              height,
              className,
              ...containerProps,
              data,
            }
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
            const Container = containerName ? lib[`Vis${containerName}`] : React.Fragment
            // console.log(Container, containerConfig, components)
            return (
              <Container {...containerConfig}>
                {components.map((c, i) => {
                  const { [`Vis${c.name}`]: Component } = lib
                  const props = c.name === name ? { ...c.props, ...hiddenProps } : c.props
                  return <Component key={`${c.name}-${i}`} {...props}/>
                })}
              </Container>
            )
          }}
        </BrowserOnly>
      }
    </>
  )
}
