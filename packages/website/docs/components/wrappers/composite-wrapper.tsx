// Copyright (c) Volterra, Inc. All rights reserved.
import * as React from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'
import { XYContainerConfigInterface } from '@volterra/vis'
import { DataRecord } from '../../utils/data'

export type ComponentProps = {
  name: string;
  props: any;
  key: string;
}
export type DocCompositeProps = {
  data: DataRecord[];
  containerProps: Partial<XYContainerConfigInterface<DataRecord>>;
  componentProps: ComponentProps[];
}
export const XYCompositeDoc = ({
  containerProps, componentProps, data,
}: DocCompositeProps): JSX.Element => {
  return (
    <BrowserOnly fallback={<div>Loading...</div>}>
      {() => {
        // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-var-requires
        const { VisXYContainer } = require('@volterra/vis-react')
        return (
          <VisXYContainer
            data={data}
            {...containerProps}
          >
            {componentProps.map((c, i) => {
              // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-var-requires
              const { [`Vis${c.name}`]: Component } = require('@volterra/vis-react')
              return <Component key={`${c.name}-${i}`} {...c.props}/>
            })}
          </VisXYContainer>
        )
      }}
    </BrowserOnly>
  )
}
