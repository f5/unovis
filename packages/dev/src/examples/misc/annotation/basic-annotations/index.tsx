import React, { useRef } from 'react'
import { VisXYContainer, VisStackedBar, VisLine, VisAxis, VisAnnotations } from '@unovis/react'
import { AnnotationItem, Scale } from '@unovis/ts'

// data
import { btcWeekly } from './btc-weekly'
const data: Array<[Date, number, number]> = btcWeekly
  .sort((a, b) => a[0] - b[0])
  .map((d) => [new Date(d[0]), d[1], d[2]])

export const title = 'Basic Annotations'
export const subTitle = 'Generated Data'
export const component = (): JSX.Element => {
  const xScale = Scale.scaleTime()
  const yScale = Scale.scaleLog().clamp(true)

  const peak2011Datum = data[47]
  const peak2013Datum = data[176]
  const peak2017Datum = data[387]
  const peak2021Datum = data[591]
  const annotations: AnnotationItem[] = [
    {
      x: '50%',
      y: '98%',
      width: '50%',
      verticalAlign: 'bottom',
      content: [{
        text: 'Bitcoin Price Peaks from 2010 to 2023',
        fontSize: 28,
        fontWeight: 700,
        fontFamily: 'Helvetica',
        color: '#1C72E8',
      },
      {
        text: 'The chart illustrates the historical price peaks of Bitcoin from its inception in 2010 through 2023.',
        fontSize: 18,
        fontFamily: 'Helvetica',
        color: '#282C34',
        fontWeight: 400,
        lineHeight: 1.5,
        marginTop: 8,
      }],
    },
    {
      x: '2%',
      y: '25%',
      width: 100,
      content: 'First peak, June 2011',
      subject: {
        x: () => xScale(peak2011Datum[0]),
        y: () => yScale(peak2011Datum[1]),
        connectorLineStrokeDasharray: '2 2',
        radius: 6,
      },
    },
    {
      x: '21%',
      y: '14%',
      width: 100,
      content: 'Second peak, November 2013',
      subject: {
        x: () => xScale(peak2013Datum[0]),
        y: () => yScale(peak2013Datum[1]),
        connectorLineStrokeDasharray: '2 2',
        radius: 6,
      },
    },
    {
      x: '45%',
      y: '5%',
      width: 100,
      content: 'Third peak, December 2017',
      subject: {
        x: () => xScale(peak2017Datum[0]),
        y: () => yScale(peak2017Datum[1]),
        connectorLineStrokeDasharray: '2 2',
        radius: 6,
      },
    },
    {
      x: '85%',
      y: '20%',
      width: 100,
      content: 'Fourth peak, October 2021',
      subject: {
        x: () => xScale(peak2021Datum[0]),
        y: () => yScale(peak2021Datum[1]),
        connectorLineStrokeDasharray: '2 2',
        radius: 6,
      },
    },
  ]

  return (
    <VisXYContainer data={data} margin={{ top: 5, left: 5 }} xScale={xScale} yScale={yScale} yDomain={[0.05, 100000]} height={'80vh'}>
      <VisLine x={(d: number[]) => d[0]} y={(d: number[]) => d[1]}/>
      <VisStackedBar color={'#aaa3'} x={(d: number[]) => d[0]} y={(d: number[]) => d[2] / 1000000000}/>
      <VisAxis type='x' numTicks={5} tickFormat={(x: Date) => x.toDateString?.()}/>
      <VisAxis type='y' numTicks={5} tickFormat={(y: number) => `$${y}`}/>
      <VisAnnotations items={annotations}/>
    </VisXYContainer>
  )
}
