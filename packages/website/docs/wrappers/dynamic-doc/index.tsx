
import React from 'react'
import { DocWrapper, DocWrapperProps } from '../base'

import './styles.css'

type DynamicWrapperProps = DocWrapperProps & {
  primaryData: any;
  secondaryData: any;
  exampleProps: Record<string, any>; // props to be passed to example (bottom) component
}

/* Displays animation of two docs alternating between two datasets. Top item will be the base case, bottom can be provided special props */
export function DynamicWrapper ({ primaryData, secondaryData, exampleProps, ...rest }: DynamicWrapperProps): JSX.Element {
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
          className="hidden"
          type="checkbox"
          defaultChecked
          onClick={() => anim.current ? stop() : start()}
        />
        <div className="anim-button"/>
      </label>
      <DocWrapper {...rest} data={current} />
      <DocWrapper hideTabLabels {...rest} data={current} {...exampleProps} />
    </div>
  )
}
