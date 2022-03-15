// Copyright (c) Volterra, Inc. All rights reserved.
import * as React from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'
import Toggle from '@theme/Toggle'
import { XYComponentConfigInterface } from '@volterra/vis'

import { DataRecord } from '../../utils/time-series'
import { XYWrapper, XYWrapperProps } from './xy-wrapper'

type DynamicWrapperProps = XYWrapperProps & {
  primaryData: DataRecord[];
  secondaryData: DataRecord[];
  exampleProps: XYComponentConfigInterface<DataRecord>; // props to be passed to bottom component
}

/* Displays animation of two XYDocs alternating between two datasets. Top item will be the base case, bottom can be provided special props */
export function DynamicXYWrapper ({ primaryData, secondaryData, exampleProps, ...rest }: DynamicWrapperProps): JSX.Element {
  const [current, setCurrent] = React.useState(secondaryData)
  const anim = React.useRef(null)

  function start (): void {
    const time = current === primaryData ? 2000 : 1200
    anim.current = setTimeout(() => {
      setCurrent(current === primaryData ? secondaryData : primaryData)
    }, time)
  }
  function stop (): void {
    clearInterval(anim.current)
    anim.current = null
  }
  React.useEffect(() => {
    start()
    return () => stop()
  }, [current])

  return (
    <BrowserOnly>
      {() => {
        return (
          <div className="input-wrapper">
            <Toggle
              className="toggle"
              /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
              // @ts-ignore
              switchConfig={{
                darkIcon: '॥',
                darkIconStyle: { fontWeight: 'bold', marginLeft: '2px' },
                lightIcon: '▶',
              }}
              checked={anim.current}
              onChange={() => (anim.current ? stop() : start())}
            />
            <XYWrapper data={current} {...rest} />
            <XYWrapper hideTabLabels data={current} {...exampleProps} {...rest} />
          </div>
        )
      }}
    </BrowserOnly>
  )
}
