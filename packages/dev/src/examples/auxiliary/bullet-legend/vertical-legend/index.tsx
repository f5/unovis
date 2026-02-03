import { randomNumberGenerator, ExampleViewerDurationProps } from '@/utils/data'
import { VisAxis, VisBulletLegend, VisStackedBar, VisXYContainer } from '@unovis/react'
import { BulletLegendOrientation } from '@unovis/ts'
import React from 'react'
import s from './styles.module.css'


export const title = 'Vertical Legend'
export const subTitle = 'Scrollable'

const seriesLabels = ['EC2', 'EKS', 'S3', 'Lambda', 'DynamoDB', 'RDS', 'SQS', 'SNS',
  'CloudWatch', 'IAM', 'Cognito', 'API Gateway', 'Kinesis', 'Elasticsearch', 'Redshift',
  'Athena', 'Glue', 'EMR', 'Sagemaker', 'Step Functions'] as const

const data = Array.from({ length: 150 }, (_, i) => ({
  time: (new Date(2021, 1, i + 1)).valueOf(),
  ...seriesLabels
    .reduce((acc, label) => ({
      ...acc,
      [label]: label.length + randomNumberGenerator() * 5,
    }), {} as Record<typeof seriesLabels[number], number>),
}))

type TimeSeriesDatum = (typeof data)[number];
const yAccessors = seriesLabels.map(label => (d: TimeSeriesDatum) => d[label])
const legendItems = seriesLabels.map(label => ({ name: label }))

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  return (
    <div className={s.chartContainer}>
      <VisBulletLegend
        className={s.legend}
        items={legendItems}
        orientation={BulletLegendOrientation.Vertical}
      />
      <VisXYContainer
        className={s.chart}
        data={data}
      >
        <VisStackedBar<TimeSeriesDatum>
          x={d => d.time}
          y={yAccessors}
          duration={props.duration}
        />
        <VisAxis type='x' tickFormat={tick => new Date(tick).toLocaleDateString()} duration={props.duration}/>
        <VisAxis type='y' duration={props.duration}/>
      </VisXYContainer>
    </div>
  )
}
