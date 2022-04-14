import * as React from 'react'
import { DocCompositeProps, VisComposite } from './doc-components'
import { FrameworkProps, DocFrameworkTabs } from './doc-tabs'

import { Component } from '.'

export type DocWrapperProps = {
  data: any[];
  name: string; // name of main component to render, i.e. "Line" will import VisLine */
  configKey: string; // specify the key for the chartConfig in typescript files
  className?: string;
  height?: number;
  showAxes?: boolean;
  containerProps?: any;
  componentProps?: Component[];
  excludeTabs: boolean;
  excludeGraph: boolean;
  hiddenProps: Record<string, any>; // props to pass to component but exclude from doc tabs
} & FrameworkProps & DocCompositeProps & Record<string, /* PropItem */ any> // using `any` to avoid type-checking complains

/* XYWrapper by default displays code snippet tabs and a Vis component with custom props */
export function DocWrapper ({
  data,
  name,
  dataType,
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
  visImports,
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
        imports={visImports}
        container={{ name: containerName, props: containerProps }}
        components={componentProps}
        mainComponent={mainComponent}
        context={showContext}
        showData={data !== undefined}
        {...{ hideTabLabels, dataType }}/>
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
          visImports={visImports}/>
      }
    </>
  )
}
