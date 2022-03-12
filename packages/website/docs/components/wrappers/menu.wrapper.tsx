// Copyright (c) Volterra, Inc. All rights reserved.
import * as React from 'react'
import Tabs from '@theme/Tabs'
import TabItem from '@theme/TabItem'

import { XYWrapper, XYWrapperProps } from './xy-wrapper'

type MenuWrapperProps = XYWrapperProps & {
  attr: string; // variable attribute for the XYComponent
  options: any[]; // options that attr can be set to (first one by default)
}
/* Displays XYDoc */
export function XYWrapperWithMenu ({ options, attr, ...rest }: MenuWrapperProps): JSX.Element {
  return (
    <Tabs className="prop-preview-menu">
      {options.map((o) => (
        <TabItem key={o} value={o} label={o}>
          <XYWrapper {...{ [attr]: o, ...rest }} />
        </TabItem>
      ))}
    </Tabs>
  )
}
