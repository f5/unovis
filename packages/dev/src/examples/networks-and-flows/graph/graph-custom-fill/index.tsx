import React from 'react'
import { VisSingleContainer, VisGraph } from '@unovis/react'
import { generateNodeLinkData, NodeDatum } from '@src/utils/data'

export const title = 'Graph: Custom Node Fills'
export const subTitle = 'Generated Data'

export const component = (): JSX.Element => {
  const svgDefs = `
    <linearGradient id="gradient" gradientTransform="rotate(90)">
      <stop stop-color="var(--vis-color2)" offset="15%"/>
      <stop stop-color="var(--vis-color1)" offset="50%"/>
      <stop stop-color="var(--vis-color0)" offset="95%"/>
    </linearGradient>
    `
  const colors = [
    { type: 'String', value: 'slategrey', symbol: '"' },
    { type: 'Hex', value: '#00C19A', symbol: '#' },
    { type: 'Short hex', value: '#eff', symbol: '#' },
    { type: 'RGB', value: 'rgb(255,255,255)', symbol: '()' },
    { type: 'None', value: undefined, symbol: '&#0;' },
    { type: 'CSS Variable', value: 'var(--vis-color0)', symbol: '--' },
    { type: 'SVG Def', value: 'url(#gradient)', symbol: '<>' },
  ]
  const data = generateNodeLinkData(colors.length)
  return (
    <VisSingleContainer svgDefs={svgDefs} height={600}>
      <VisGraph
        data={data}
        nodeFill={(n: NodeDatum) => colors[n.i % colors.length].value}
        nodeIcon={(n: NodeDatum) => colors[n.i % colors.length].symbol}
        nodeLabel={(n: NodeDatum) => colors[n.i % colors.length].type}
      />
    </VisSingleContainer>
  )
}

