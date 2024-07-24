import React, { useEffect, useMemo, useState } from 'react'
import { VisSingleContainer, VisGraph } from '@unovis/react'
import { GraphLayoutType } from '@unovis/ts'
import { generateNodeLinkData, rng } from '@src/utils/data'

export const title = 'Dynamic Layout'
export const subTitle = 'Select Layout From Dropdown'

export const component = (): JSX.Element => {
  const [data, setData] = useState(generateNodeLinkData(50))
  const layouts = Object.values(GraphLayoutType)
  const initial = GraphLayoutType.Circular
  const [layout, setLayout] = useState<string>(initial)

  // Generate new data every 2 seconds
  useEffect(() => {
    setTimeout(() => {
      const newData = generateNodeLinkData(10 + Math.floor(rng() * 50))

      // Adding some random x, y values to the nodes for `GraphLayoutType.Precalculated`
      newData.nodes.forEach(n => {
        n.x = rng() * 1000
        n.y = rng() * 1000
      })

      setData(newData)
    }, 2000)
  }, [data])

  const forceLayoutSettings = useMemo(() => ({
    fixNodePositionAfterSimulation: true,
  }), [])

  return (
    <>
      <select onChange={e => setLayout(e.target.value)} defaultValue={initial}>
        {layouts.map(l => <option key={l} value={l}>{l}</option>)}
      </select>
      <VisSingleContainer data={data} height={900}>
        <VisGraph layoutType={layout} forceLayoutSettings={forceLayoutSettings}/>
      </VisSingleContainer>
    </>
  )
}

