/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/no-var-requires */
import * as React from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'
import { DocCompositeProps } from './types'

export const VisComposite = ({
  containerProps, componentProps,
}: DocCompositeProps): JSX.Element => {
  return (
    <BrowserOnly fallback={<div>Loading...</div>}>
      {() => {
        const lib = require('@volterra/vis-react')
        const { [`Vis${containerProps.name}`]: VisContainer } = lib
        return (
          <VisContainer {...containerProps}>
            {componentProps.map((c, i) => {
              const { [`Vis${c.name}`]: Component } = lib
              const props = c.props
              return <Component key={`${c.name}-${i}`} {...props}/>
            })}
          </VisContainer>
        )
      }}
    </BrowserOnly>
  )
}
