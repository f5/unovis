import * as React from 'react'
import { VisComposite } from './doc-components'
import { DocFrameworkTabs } from './doc-tabs'
import { DocWrapperProps } from './types'

/* XYWrapper by default displays code snippet tabs and a Vis component with custom props */
export function DocWrapper ({
  data,
  name,
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
  containerProps,
  componentProps = [],
  imports,
  ...rest
}: DocWrapperProps): JSX.Element {
  const mainComponent = name && { name: name, props: rest, key: configKey }
  if (name.endsWith('Container')) {
    containerProps = rest
  }

  return (
    <>
      {!excludeTabs &&
      <DocFrameworkTabs
        imports={imports}
        container={{
          name: containerName,
          props: data ? { data, ...containerProps } : containerProps,
        }}
        components={componentProps}
        mainComponent={mainComponent}
        context={showContext}
        {...{ hideTabLabels, dataType, declarations }}/>
      }
      {!excludeGraph &&
        <VisComposite
          containerProps={{
            data,
            name: containerName,
            height: height,
            className: rest.className,
            ...containerProps,
          }}
          componentProps={name && !name.endsWith('Container')
            ? [...componentProps, { name: name, props: { ...rest, ...hiddenProps } }]
            : componentProps}
          imports={imports}/>
      }
    </>
  )
}
