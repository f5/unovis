/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/no-var-requires */
import * as React from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'
import { CodeSnippet } from '@site/src/components/CodeSnippet'
import { generateSnippets } from '@site/src/utils/snippet-generator'
import { DocWrapperProps } from '../types'
import { DocFrameworkTabs } from './doc-tabs'


/* XYWrapper by default displays code snippet tabs and a Vis component with custom props */
export function DocWrapper ({
  data,
  name,
  className,
  dataType,
  declarations,
  containerName,
  height,
  hideTabLabels,
  showContext,
  excludeTabs,
  excludeGraph,
  hiddenProps,
  configKey,
  containerProps = {},
  components = [],
  imports,
  ...rest
}: DocWrapperProps): JSX.Element {
  if (data) {
    if (!containerName) {
      rest.data = data
    } else {
      containerProps.data = data
    }
  }
  if (name !== containerName) {
    components = [...components, { name, key: configKey, props: rest }]
  } else {
    containerProps = { ...containerProps, ...rest }
  }
  const container = { name: containerName, props: containerProps }
  return (
    <>
      {!excludeTabs &&
      // <DocFrameworkTabs
      //   imports={imports}
      //   container={{
      //     name: containerName,
      //     props: containerProps,
      //   }}
      //   showData={data !== undefined}
      //   components={components}
      //   context={showContext}
      //   mainComponent={name}
      //   {...{ hideTabLabels, dataType, declarations }}/>
      <CodeSnippet {...generateSnippets(data, components, container)}/>
      }
      {!excludeGraph &&
        <BrowserOnly fallback={<div>Loading...</div>}>
          {() => {
            const containerConfig = {
              data,
              height,
              className,
              ...containerProps,
            }
            const lib = require('@unovis/react')
            if (!containerName) {
              return (
                <>
                  {components.map((c, i) => {
                    const { [`Vis${c.name}`]: Component } = lib
                    const props = c.name === name ? { ...containerConfig, ...c.props, ...hiddenProps } : c.props
                    return <Component key={`${c.name}-${i}`} {...props}/>
                  })}
                </>
              )
            }
            const { [`Vis${containerName}`]: VisContainer } = lib
            return (
              <VisContainer {...containerConfig}>
                {components.map((c, i) => {
                  const { [`Vis${c.name}`]: Component } = lib
                  const props = c.name === name ? { ...c.props, ...hiddenProps } : c.props
                  return <Component key={`${c.name}-${i}`} {...props}/>
                })}
              </VisContainer>
            )
          }}
        </BrowserOnly>
      }
    </>
  )
}
