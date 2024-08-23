import { JSX } from 'solid-js'
import { Scale } from '@unovis/ts'
import { VisAnnotations, VisAxis, VisLine, VisStackedBar, VisXYContainer } from '@unovis/solid'

import { data, DataRecord } from './data'

const BasicAnnotations = (): JSX.Element => {
  const xScale = Scale.scaleTime()
  const yScale = Scale.scaleLog().clamp(true)

  // Annotation points
  const peak2011Datum = data[47]
  const peak2013Datum = data[176]
  const peak2017Datum = data[387]
  const peak2021Datum = data[591]

  const annotations = [
    {
      x: '50%',
      y: '98%',
      width: '50%',
      verticalAlign: 'bottom',
      content: [
        {
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
        },
      ],
    },
    {
      x: '2%',
      y: '25%',
      width: 100,
      content: 'First peak, June 2011',
      subject: {
        x: () => xScale(peak2011Datum.weekStart),
        y: () => yScale(peak2011Datum.price),
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
        x: () => xScale(peak2013Datum.weekStart),
        y: () => yScale(peak2013Datum.price),
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
        x: () => xScale(peak2017Datum.weekStart),
        y: () => yScale(peak2017Datum.price),
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
        x: () => xScale(peak2021Datum.weekStart),
        y: () => yScale(peak2021Datum.price),
        connectorLineStrokeDasharray: '2 2',
        radius: 6,
      },
    },
  ]

  const date = (d: DataRecord) => d.weekStart
  const price = (d: DataRecord) => d.price
  const volume = (d: DataRecord) => d.volume / 1000000000

  const yearTickFormat = (x: Date) => x.getFullYear?.().toString()
  const priceTickFormat = (y: number) => `$${y}`

  return (
    <VisXYContainer
      data={data}
      height='50dvh'
      xScale={xScale}
      yScale={yScale}
      yDomain={[0.05, 100000]}
    >
      <VisLine x={date} y={price} />
      <VisStackedBar color='#aaa3' x={date} y={volume} />
      <VisAxis type='x' numTicks={5} tickFormat={yearTickFormat} />
      <VisAxis type='y' numTicks={5} tickFormat={priceTickFormat} />
      <VisAnnotations items={annotations} />
    </VisXYContainer>
  )
}

export default BasicAnnotations
