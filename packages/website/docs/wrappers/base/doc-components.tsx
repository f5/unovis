// Copyright (c) Volterra, Inc. All rights reserved.
import * as React from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'
import { DocCompositeProps } from './types'

export const VisComposite = ({
  containerProps, componentProps, visImports,
}: DocCompositeProps): JSX.Element => {
  return (
    <BrowserOnly fallback={<div>Loading...</div>}>
      {() => {
        // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-var-requires
        const { [`Vis${containerProps.name}`]: VisContainer } = require('@volterra/vis-react')
        const imports = {}
        if (visImports) {
          // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-var-requires
          visImports.forEach(i => { imports[i] = require('@volterra/vis')[i] })
        }
        return (
          <VisContainer
            {...containerProps}
          >
            {componentProps.map((c, i) => {
              // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-var-requires
              const { [`Vis${c.name}`]: Component } = require('@volterra/vis-react')
              const props = c.props
              Object.entries(props).forEach(([k, v]) => {
                if (typeof v === 'string') {
                  const [i, rest] = v.split('.')
                  if (imports[i]) {
                    props[k] = rest ? imports[i][rest.replace('()', '')]() : imports[i]
                  }
                }
              })
              return <Component key={`${c.name}-${i}`} {...props}/>
            })}
          </VisContainer>
        )
      }}
    </BrowserOnly>
  )
}