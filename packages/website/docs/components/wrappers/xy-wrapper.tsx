import { XYComponentConfigInterface } from '@volterra/vis'
import * as React from 'react'
import { DataRecord } from '../../utils/data'
import { ComponentConfig, FrameworkProps, parseProps, parseXYConfig } from '../../utils/props-helper'
import { CompositeWrapper } from './composite-wrapper'
import { XYDocTabs, DocTabsProps, ContextLevel } from './doc-tabs.wrapper'

const axes = ['x', 'y'].map(t => ({ name: 'Axis', props: { type: t }, key: `${t}Axis` }))

export type XYWrapperProps = {
  data: any;
  dataType: 'DataRecord' | 'MapArea, MapPoint, MapLink';
  imports?: string[];
  containerName: string;
  name: string; // name of component to render, i.e. "Line" will import VisLine */
  className?: string;
  height?: number;
  showAxes?: boolean;
  containerProps?: any;
  componentProps?: ComponentConfig[];
  excludeTabs: boolean;
  excludeGraph: boolean;
  hiddenProps: Partial<XYComponentConfigInterface<DataRecord>>; // props to pass to component but exclude from doc tabs
  xyConfigKey: string; // specify the key for the chartConfig in typescript files
} & DocTabsProps & Record<string, /* PropItem */ any> // using `any` to avoid type-checking complains

/* XYWrapper by default displays code snippet tabs and a Vis component with custom props */
export function XYWrapper ({
  data,
  dataType,
  containerName = 'XY',
  imports,
  name,
  height,
  showAxes,
  hideTabLabels,
  showContext,
  excludeTabs,
  excludeGraph,
  hiddenProps,
  xyConfigKey,
  containerProps,
  componentProps,
  children,
  ...rest
}: XYWrapperProps): JSX.Element {
  const mainComponent = { name: name, props: rest, key: xyConfigKey || 'components', dataType: dataType, imports: imports }
  componentProps = componentProps || []
  if (name !== 'XYContainer') {
    componentProps = [mainComponent, ...componentProps]
  }
  let docTabsProps: FrameworkProps
  if (!excludeTabs) {
    docTabsProps = showContext === ContextLevel.Full ? parseXYConfig(componentProps) : parseProps(name, rest, true, mainComponent.key, mainComponent.dataType, imports)
  }
  mainComponent.props = { ...rest, ...hiddenProps }
  return (
    <>
      {!excludeTabs && <XYDocTabs {...{ containerName, showContext, hideTabLabels, dataType, ...docTabsProps }} />}
      {children}
      {!excludeGraph &&
        <CompositeWrapper
          containerProps={{
            name: containerName,
            data: data,
            height: height || 150,
            className: rest.className,
            ...containerProps,
          }}
          componentProps={showAxes ? componentProps.concat(axes) : componentProps}/>
      }
    </>
  )
}
