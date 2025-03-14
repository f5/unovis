import { ExampleGroup } from '@/examples'
import React from 'react'
import { Params, useLoaderData, useSearchParams } from 'react-router-dom'
// Styles
import s from './style.module.css'


// eslint-disable-next-line @typescript-eslint/ban-types
export type ExampleViewerProps = {
  examples: ExampleGroup[];
}

type ExampleViewerUrlParams = {
  title: string;
  group: string;
}

export type ExampleViewerDurationProps = {
  duration: number | undefined;
}

export async function exampleViewerLoader ({ params }: { params: Params }): Promise<Params> {
  return params
}

export function ExampleViewer (props: ExampleViewerProps): React.ReactNode {
  const params = useLoaderData() as ExampleViewerUrlParams
  const [searchParams] = useSearchParams()
  const urlDuration = searchParams.get('duration') && !isNaN(+searchParams.get('duration')) ? +searchParams.get('duration') : 600
  const exampleTitle = params?.title
  const exampleGroupTitle = params?.group
  const exampleGroup = props.examples?.find(d => d.title === exampleGroupTitle)
  const exampleItem = exampleGroup?.items.find(d => d.title === exampleTitle)

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const Component = exampleItem?.component as React.FC

  return (
    <div className={s.exampleViewer}>
      { exampleItem
        ? <Component duration={urlDuration}/>
        : <div className={s.nothingSelected}>🖼 Select an example to view it</div>
      }
    </div>
  )
}
