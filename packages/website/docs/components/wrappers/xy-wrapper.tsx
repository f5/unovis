import { presets } from '@site/babel.config'
import { XYComponentConfigInterface } from '@volterra/vis'
import * as React from 'react'
import { DataRecord } from '../../utils/data'
import { parseProps, parseXYConfig } from '../../utils/props-helper'
import { ComponentProps, XYCompositeDoc } from './composite-wrapper'
import { XYDocTabs, DocTabsProps } from './doc-tabs.wrapper'

const axes = ['x', 'y'].map(t => ({ name: 'Axis', props: { type: t }, key: `${t}Axis` }))

export type XYWrapperProps = {
  data: DataRecord[];
  name: string; // name of component to render, i.e. "Line" will import VisLine */
  className?: string;
  height?: number;
  showAxes?: boolean;
  componentProps?: ComponentProps[];
  excludeTabs: boolean;
  excludeGraph: boolean;
  hiddenProps: Partial<XYComponentConfigInterface<DataRecord>>; // props to pass to component but exclude from doc tabs
  xyConfigKey: string; // specify the key for the chartConfig in typescript files
} & DocTabsProps & Record<string, /* PropItem */ any> // using `any` to avoid type-checking complains

/* XYWrapper by default displays code snippet tabs and a Vis component with custom props */
export function XYWrapper ({
  data,
  name,
  height,
  showAxes,
  hideTabLabels,
  showContext,
  excludeTabs,
  excludeGraph,
  hiddenProps,
  xyConfigKey,
  componentProps,
  children,
  ...rest
}: XYWrapperProps): JSX.Element {
  const mainComponent = { name: name, props: rest, key: xyConfigKey || 'components' }
  componentProps = componentProps || []
  if (name !== 'XYContainer') {
    componentProps = [mainComponent, ...componentProps]
  }
  const docTabsProps = (showContext ? parseXYConfig(componentProps) : parseProps(name, rest, false, xyConfigKey))
  mainComponent.props = { ...rest, ...hiddenProps }

  return (
    <>
      {!excludeTabs && <XYDocTabs {...{ showContext, hideTabLabels, ...docTabsProps }} />}
      {children}
      {!excludeGraph &&
        <XYCompositeDoc
          data={data}
          containerProps={{ height: height || 150, ...rest }}
          componentProps={showAxes ? componentProps.concat(axes) : componentProps}/>
      }
    </>
  )
}
