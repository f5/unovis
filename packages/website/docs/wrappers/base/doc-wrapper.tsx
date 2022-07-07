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
  const mainComponent = name && { name: name, props: rest, key: configKey }
  const standAlone = ['XYContainer'].includes(name)

  if (standAlone) {
    containerName = name
    containerProps = rest
    if (data) mainComponent.props = { data, ...mainComponent.props }
  }
  const containerConfig = {
    data,
    height,
    className,
  }


  if (data !== undefined) {
    if (containerName !== undefined) containerProps.data = data
    else {
      mainComponent.props.data = data
    }
  }

  return (
    <>
      {!excludeTabs &&
      <DocFrameworkTabs
        imports={imports}
        container={containerName && {
          name: containerName,
          props: data ? { data, ...containerProps } : containerProps,
        }}
        showData={data !== undefined && showContext}
        components={componentProps}
        mainComponent={mainComponent}
        context={showContext}
        {...{ hideTabLabels, dataType, declarations }}/>
      }
      {!excludeGraph &&
        <BrowserOnly fallback={<div>Loading...</div>}>
          {() => {
            const lib = require('@volterra/vis-react')
            const { [`Vis${name}`]: MainComponent } = lib
            const Components = (config?: Partial<DocWrapperProps>): JSX.Element => (
              <>
                <MainComponent {...config} {...rest} {...hiddenProps}/>
                {componentProps.map((c, i) => {
                  const { [`Vis${c.name}`]: Component } = lib
                  const props = c.props
                  return <Component key={`${c.name}-${i}`} {...props}/>
                })}
              </>
            )
            if (!containerName) {
              return <MainComponent {...containerConfig} {...rest} {...hiddenProps}/>
            }
            const { [`Vis${containerName}`]: VisContainer } = lib
            return (
              <VisContainer {...containerConfig} {...containerProps}>
                <Components/>
              </VisContainer>
            )
          }}
        </BrowserOnly>
      }
    </>
  )
}
