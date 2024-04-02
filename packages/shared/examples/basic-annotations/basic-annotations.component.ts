import { Component, OnInit } from '@angular/core'
import { AnnotationItem, Scale } from '@unovis/ts'
import { data, DataRecord } from './data'

@Component({
  selector: 'basic-annotations',
  templateUrl: './basic-annotations.component.html',
})
export class BasicAnnotationsComponent implements OnInit {
  data = data
  xScale = Scale.scaleTime()
  yScale = Scale.scaleLog().clamp(true)
  annotations: AnnotationItem[] = []

  ngOnInit (): void {
    const peak2011Datum = this.data[47]
    const peak2013Datum = this.data[176]
    const peak2017Datum = this.data[387]
    const peak2021Datum = this.data[591]

    this.annotations = [
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
          x: () => this.xScale(peak2011Datum.weekStart),
          y: () => this.yScale(peak2011Datum.price),
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
          x: () => this.xScale(peak2013Datum.weekStart),
          y: () => this.yScale(peak2013Datum.price),
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
          x: () => this.xScale(peak2017Datum.weekStart),
          y: () => this.yScale(peak2017Datum.price),
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
          x: () => this.xScale(peak2021Datum.weekStart),
          y: () => this.yScale(peak2021Datum.price),
          connectorLineStrokeDasharray: '2 2',
          radius: 6,
        },
      },
    ]
  }

  date = (d: DataRecord): Date => d.weekStart
  price = (d: DataRecord): number => d.price
  volume = (d: DataRecord): number => d.volume / 1000000000
  yearTickFormat = (x: Date): string => x.getFullYear().toString()
  priceTickFormat = (y: number): string => `$${y}`
}
