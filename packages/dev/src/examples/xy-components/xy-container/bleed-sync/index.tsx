import React, { useCallback, useState } from 'react'
import { Spacing } from '@unovis/ts'
import { VisXYContainer, VisScatter, VisLine, VisArea, VisStackedBar, VisAxis } from '@unovis/react'
import { generateXYDataRecords, XYDataRecord } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Bleed Synchronization'
export const subTitle = 'Sharing bleed between containers'

const data = generateXYDataRecords(25)
const xDomain: [number, number] = [1, 20]

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [syncBleed, setSyncBleed] = useState(true)
  const [scatterBleed, setScatterBleed] = useState<Spacing>()

  const x = useCallback((d: XYDataRecord) => d.x, [])
  const y = useCallback((d: XYDataRecord) => d.y, [])

  // The Scatter chart needs the most horizontal space to fit its points, so we take
  // its bleed from the `onRenderComplete` callback and pass it to the charts below
  const onRenderComplete = useCallback((svg: SVGSVGElement, margin: Spacing, bleed: Spacing): void => {
    setScatterBleed(prev => (prev?.left === bleed.left && prev?.right === bleed.right)
      ? prev
      : { left: bleed.left, right: bleed.right }
    )
  }, [])

  // We synchronize the `left` and `right` values only, `top` and `bottom` are left
  // undefined so that every chart falls back to its own calculated vertical bleed
  const bleed = syncBleed ? scatterBleed : undefined

  return (
    <>
      <label>
        <input type='checkbox' checked={syncBleed} onChange={e => setSyncBleed(e.target.checked)}/>
        Synchronize bleed
      </label>

      <VisXYContainer data={data} height={150} xDomain={xDomain} onRenderComplete={onRenderComplete}>
        <VisScatter x={x} y={y} size={30} duration={props.duration}/>
        <VisAxis type='x' duration={props.duration}/>
        <VisAxis type='y' duration={props.duration}/>
      </VisXYContainer>

      <VisXYContainer data={data} height={150} xDomain={xDomain} bleed={bleed}>
        <VisStackedBar x={x} y={y} duration={props.duration}/>
        <VisAxis type='x' duration={props.duration}/>
        <VisAxis type='y' duration={props.duration}/>
      </VisXYContainer>

      <VisXYContainer data={data} height={150} xDomain={xDomain} bleed={bleed}>
        <VisArea x={x} y={y} duration={props.duration}/>
        <VisAxis type='x' duration={props.duration}/>
        <VisAxis type='y' duration={props.duration}/>
      </VisXYContainer>

      <VisXYContainer data={data} height={150} xDomain={xDomain} bleed={bleed}>
        <VisLine x={x} y={y} duration={props.duration}/>
        <VisAxis type='x' duration={props.duration}/>
        <VisAxis type='y' duration={props.duration}/>
      </VisXYContainer>
    </>
  )
}
