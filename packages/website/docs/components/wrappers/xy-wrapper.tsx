import { XYComponentConfigInterface } from '@volterra/vis'
import * as React from 'react'
import { DataRecord } from '../../utils/data'
import { parseProps } from '../../utils/props-helper'
import { ComponentProps, XYCompositeDoc } from './composite-wrapper'
import { DocGraphProps } from './doc-vis.wraper'
import { XYDocTabs, DocTabsProps } from './doc-tabs.wrapper'

const axes = ['x', 'y'].map(t => ({ name: 'Axis', props: { type: t }, key: `${t}Axis` }))

export type XYWrapperProps = {
  componentProps?: ComponentProps[];
  excludeTabs: boolean;
  excludeGraph: boolean;
  hiddenProps: Partial<XYComponentConfigInterface<DataRecord>>; // props to pass to component but exclude from doc tabs
  xyConfigKey: string; // specify the key for the chartConfig in typescript files (default = "components")
} & DocGraphProps & DocTabsProps & Record<string, /* PropItem */ any> // using `any` to avoid type-checking complains

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
  ...rest
}: XYWrapperProps): JSX.Element {
  if (!componentProps) {
    componentProps = [{ name: name, props: { ...hiddenProps, ...rest }, key: 'components' }]
    xyConfigKey = 'components'
  }
  return (
    <>
      {!excludeTabs && <XYDocTabs {...{ showContext, hideTabLabels, ...parseProps(name, rest, showContext, xyConfigKey) }} />}
      {!excludeGraph &&
        <XYCompositeDoc
          data={data}
          containerProps={{ height: height || 150, ...rest }}
          componentProps={showAxes ? componentProps.concat(axes) : componentProps}/>
      }
    </>
  )
}
