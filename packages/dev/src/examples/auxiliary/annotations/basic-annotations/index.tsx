import React, { useEffect, useRef, useState } from 'react'
import { VisXYContainer, VisLine, VisAxis, VisAnnotations, VisLineRef } from '@unovis/react'
import { AnnotationItem } from '@unovis/ts'
import { randomNumberGenerator } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Basic Annotations'
export const subTitle = 'Dynamic Data Updates'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const height = 400
  const length = 10
  const min = 3
  const max = 8
  const generateData = (): number[] => Array.from({ length }, () => randomNumberGenerator() * (max - min) + min)

  const ref = useRef<VisLineRef<number>>(null)
  const [data, setData] = useState<number[]>(generateData)
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([])

  useEffect(() => {
    if (!ref.current?.component) return
    const { xScale, yScale } = ref.current.component
    const peaks = data.reduce((acc, y, x) => {
      acc.min = Math.min(acc.min, y)
      acc.max = Math.max(acc.max, y)
      acc.total += y
      if (x === data.length - 1) {
        acc.items.push({
          x: 20,
          y: yScale(min) + 10,
          content: [
            { text: 'Stats', fontSize: 20, fontWeight: 700, color: '#1C72E8' },
            { text: `Min: ${acc.min}`, fontSize: 14 },
            { text: `Max: ${acc.max}`, fontSize: 14 },
            { text: `Range: ~${(acc.max - acc.min).toFixed(2)}`, fontSize: 14 },
            { text: `Mean: ~${(acc.total / data.length).toFixed(2)}`, fontSize: 14 },
          ],
        }, {
          x: 'calc(100% - 10px + (60px - 70px))', // 100% - 20px
          y: '5px',
          content: 'Min',
          verticalAlign: 'middle',
          textAlign: 'left',
          subject: {
            x: () => xScale(data.indexOf(acc.min)),
            y: () => yScale(acc.min),
            connectorLineStrokeDasharray: '2 2',
          },
        })
      } else if (y > data[x - 1] && y > data[x + 1]) {
        acc.items.push({
          x: `${(x / 9 * 100)}%`, //
          y: yScale(y + 1.5),
          content: `Peak: [x: ${x}, y: ${y.toFixed(1)}]`,
          verticalAlign: 'bottom',
          textAlign: 'center',
          subject: {
            x: () => xScale(x),
            y: () => yScale(y),
            radius: 6,
          },
        })
      }
      return acc
    }, { min: max, max: min, total: 0, items: new Array<AnnotationItem>() })
    setAnnotations(peaks.items)
  }, [data, ref.current?.component])


  return (
    <>
      <button onClick={() => setData(generateData())}>Update Data</button>
      <VisXYContainer data={data} height={height} margin={{ right: 100 }} yDomain={[0, 10]}>
        <VisLine ref={ref} x={(_, i) => i as number} y={d => d} duration={props.duration}/>
        <VisAxis type='x' numTicks={5} duration={props.duration}/>
        <VisAxis type='y' numTicks={5} duration={props.duration}/>
        <VisAnnotations items={annotations} duration={props.duration}/>
      </VisXYContainer>
    </>
  )
}
