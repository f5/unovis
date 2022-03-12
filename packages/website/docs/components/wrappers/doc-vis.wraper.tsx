// Copyright (c) Volterra, Inc. All rights reserved.
import * as React from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'
import { XYComponentConfigInterface } from '@volterra/vis'

import { DataRecord } from '../../utils/time-series'

export type DocGraphProps = {
  componentProps: Partial<XYComponentConfigInterface<DataRecord>>;
  data: DataRecord[];
  name: string; // name of component to render, i.e. "Line" will import VisLine */
  className?: string;
  height?: number;
  showAxes?: boolean;
}
/* Displays VisContainer and VisComponent with given props */
export const XYComponentDoc = ({
  data,
  name,
  height,
  showAxes,
  className,
  componentProps,
}: DocGraphProps): JSX.Element => {
  return (
    <BrowserOnly fallback={<div>Loading...</div>}>
      {() => {
        // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-var-requires
        const { VisXYContainer, [`Vis${name}`]: Component, VisAxis } = require('@volterra/vis-react')

        return (
          <VisXYContainer
            data={data}
            height={height ?? 150}
            className={className}
          >
            <Component {...componentProps} />
            {!!showAxes && (
              <>
                <VisAxis type="x" />
                <VisAxis type="y" />
              </>
            )}
          </VisXYContainer>
        )
      }}
    </BrowserOnly>
  )
}
