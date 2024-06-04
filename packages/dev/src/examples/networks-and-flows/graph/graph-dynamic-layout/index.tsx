import React, { useMemo, useState } from 'react'
import { VisSingleContainer, VisGraph } from '@unovis/react'
import { GraphLayoutType } from '@unovis/ts'
import { generateNodeLinkData } from '@src/utils/data'

export const title = 'Dynamic Layout'
export const subTitle = 'Select Layout From Dropdown'

export const component = (): JSX.Element => {
  const data = useMemo(() => generateNodeLinkData(50, () => 1), [])
  const layouts = Object.values(GraphLayoutType)
  const initial = GraphLayoutType.Circular
  const [layout, setLayout] = useState<string>(initial)

  return (
    <>
      <select onChange={e => setLayout(e.target.value)} defaultValue={initial}>
        {layouts.map(l => <option key={l} value={l}>{l}</option>)}
      </select>
      <VisSingleContainer data={data} height={900}>
        <VisGraph layoutType={layout}/>
      </VisSingleContainer>
    </>
  )
}

