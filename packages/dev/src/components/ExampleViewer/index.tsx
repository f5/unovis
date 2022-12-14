import React from 'react'
import { Params, useLoaderData } from 'react-router-dom'

import { ExampleGroup } from '@src/examples'

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

export async function exampleViewerLoader ({ params }: { params: Params }): Promise<Params> {
  return params
}

export function ExampleViewer (props: ExampleViewerProps): JSX.Element {
  const params = useLoaderData() as ExampleViewerUrlParams
  const exampleTitle = params?.title
  const exampleGroupTitle = params?.group
  const exampleGroup = props.examples?.find(d => d.title === exampleGroupTitle)
  const exampleItem = exampleGroup?.items.find(d => d.title === exampleTitle)

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const Component = exampleItem?.component as React.FC
  return (
    <div className={s.exampleViewer}>
      { exampleItem
        ? <Component />
        : <div className={s.nothingSelected}>🖼 Select an example to view it</div>
      }
    </div>
  )
}
