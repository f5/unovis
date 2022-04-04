// Copyright (c) Volterra, Inc. All rights reserved.
import React from 'react'
import { XYComponentConfigInterface } from '@volterra/vis'

import { DataRecord } from '../../utils/data'
import { XYWrapper, XYWrapperProps } from './xy-wrapper'

type DynamicWrapperProps = XYWrapperProps & {
  primaryData: DataRecord[];
  secondaryData: DataRecord[];
  exampleProps: XYComponentConfigInterface<DataRecord>; // props to be passed to (example) component
}

/* Displays animation of two XYDocs alternating between two datasets. Top item will be the base case, bottom can be provided special props */
export function DynamicXYWrapper ({ primaryData, secondaryData, exampleProps, ...rest }: DynamicWrapperProps): JSX.Element {
  const [current, setCurrent] = React.useState(secondaryData)
  const anim = React.useRef(null)

  function start (): void {
    const time = current === primaryData ? 1200 : 2000
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
    <div className="input-wrapper">
      <label className="toggle">
        <input
          className='hidden'
          type="checkbox"
          defaultChecked
          onClick={() => anim.current ? stop() : start()}
        />
        <div className="anim-button"/>
      </label>
      <XYWrapper {...rest} data={current} />
      <XYWrapper hideTabLabels {...rest} data={current} {...exampleProps} />
    </div>
  )
}
