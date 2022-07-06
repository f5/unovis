/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/no-var-requires */
import * as React from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'
import { DocWrapperProps } from './types'
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
  componentProps = [],
  imports,
  ...rest
}: DocWrapperProps): JSX.Element {
  const mainComponent = { name: name, props: rest, key: configKey }
  const components = name === containerName ? componentProps : [mainComponent, ...componentProps]


  if (!containerName && data) {
    mainComponent.props.data = data
  }

  return (
    <>
      {!excludeTabs &&
      <DocFrameworkTabs
        imports={imports}
        container={name === containerName ? mainComponent : {
          name: containerName,
          props: data && containerName ? { data, ...containerProps } : containerProps,
        }}
        showData={data !== undefined && showContext}
        components={components}
        context={showContext}
        mainComponent={name}
        {...{ hideTabLabels, dataType, declarations }}/>
      }
      {!excludeGraph &&
        <BrowserOnly fallback={<div>Loading...</div>}>
          {() => {
            const containerConfig = {
              data,
              height,
              className,
              ...containerProps,
              ...(name === containerName ? { ...rest, ...hiddenProps } : {}),
            }
            const lib = require('@volterra/vis-react')
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
