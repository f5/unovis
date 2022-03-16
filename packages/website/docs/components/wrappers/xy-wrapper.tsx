import { XYComponentConfigInterface } from '@volterra/vis'
import * as React from 'react'
import { DataRecord } from '../../utils/data'
import { parseProps } from '../../utils/props-helper'
import { XYComponentDoc, DocGraphProps } from './doc-vis.wraper'
import { XYDocTabs, DocTabsProps } from './doc-tabs.wrapper'

export type XYWrapperProps = {
  excludeTabs: boolean;
  excludeGraph: boolean;
  hiddenProps: Partial<XYComponentConfigInterface<DataRecord>>; // props to pass to component but exclude from doc tabs
} & DocGraphProps & DocTabsProps & Record<string, /* PropItem */ any> // using `any` to avoid type-checking complains

/* XYWrapper by default displays code snippet tabs and a Vis component with custom props */
export function XYWrapper ({
  data,
  name,
  height,
  showAxes,
  className,
  hideTabLabels,
  showContext,
  excludeTabs,
  excludeGraph,
  hiddenProps,
  ...rest
}: XYWrapperProps): JSX.Element {
  return (
    <>
      {!excludeTabs && <XYDocTabs {...{ showContext, hideTabLabels, ...parseProps(name, rest, showContext) }} />}
      {!excludeGraph && <XYComponentDoc {...{ data, name, height, showAxes, className, componentProps: { ...hiddenProps, ...rest } }} />}
    </>
  )
}
