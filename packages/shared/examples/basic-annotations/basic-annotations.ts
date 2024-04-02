import { XYContainer, Annotations, Axis, Line, StackedBar, Scale } from '@unovis/ts'

import { data, DataRecord } from './data'

// Scales
const xScale = Scale.scaleTime()
const yScale = Scale.scaleLog().clamp(true)

// Accessors
const date = (d: DataRecord): Date => d.weekStart
const price = (d: DataRecord): number => d.price
const volume = (d: DataRecord): number => d.volume / 1000000000

// Annotation points
const peak2011Datum = data[47]
const peak2013Datum = data[176]
const peak2017Datum = data[387]
const peak2021Datum = data[591]

// Components
const lineChart = new Line<DataRecord>({ x: date, y: price })
const barChart = new StackedBar<DataRecord>({ x: date, y: volume, color: '#aaa3' })

// Container
const chart = new XYContainer(document.getElementById('vis-container'), {
  height: 600,
  xScale,
  yDomain: [0.05, 100000],
  yScale,
  components: [lineChart, barChart],
  xAxis: new Axis({ numTicks: 5, tickFormat: (x: Date) => x.getFullYear?.() }),
  yAxis: new Axis({ numTicks: 5, tickFormat: (y: number) => `$${y}` }),
  annotations: new Annotations({
    items: [{
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
    ],
  }),
}, data)
