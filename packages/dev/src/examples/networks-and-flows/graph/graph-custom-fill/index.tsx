import React, { useMemo } from 'react'
import { VisSingleContainer, VisGraph, VisTooltip } from '@unovis/react'
import { Graph } from '@unovis/ts'
import { generateNodeLinkData, NodeDatum, LinkDatum } from '@/utils/data'
import { ExampleViewerDurationProps } from '@/components/ExampleViewer/index'

type ExtendedNodeDatum = NodeDatum & { i: number }

export const title = 'Graph: Custom Node Fills with Tooltip'
export const subTitle = 'Generated Data'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const svgDefs = `
    <linearGradient id="gradient" gradientTransform="rotate(90)">
      <stop stop-color="var(--vis-color2)" offset="15%"/>
      <stop stop-color="var(--vis-color1)" offset="50%"/>
      <stop stop-color="var(--vis-color0)" offset="95%"/>
    </linearGradient>
    `
  const colors = [
    { type: 'String', value: 'slategrey', symbol: '"', tooltip: 'This is a string color' },
    { type: 'Hex', value: '#00C19A', symbol: '#', tooltip: 'This is a hex color' },
    { type: 'Short hex', value: '#eff', symbol: '#', tooltip: '' }, // Empty string - empty tooltip
    { type: 'RGB', value: 'rgb(255,255,255)', symbol: '()', tooltip: null }, // Null - no tooltip
    { type: 'None', value: undefined, symbol: '&#0;', tooltip: undefined }, // Undefined - empty tooltip
    { type: 'CSS Variable', value: 'var(--vis-color0)', symbol: '--', tooltip: 'This is a CSS variable' },
    { type: 'SVG Def', value: 'url(#gradient)', symbol: '<>', tooltip: 'This is an SVG definition' },
  ]
  const data = generateNodeLinkData(colors.length)

  const tooltipTriggers = useMemo(() => ({
    [Graph.selectors.node]: (datum: ExtendedNodeDatum): string | null | undefined => {
      const tooltipContent = colors[datum.i % colors.length].tooltip
      return tooltipContent
    },
  }), [colors])

  return (
    <VisSingleContainer svgDefs={svgDefs} height={600}>
      <VisTooltip triggers={tooltipTriggers} attributes={{
        visGraphNodeTooltipE2eTestId: 'graph-node-tooltip',
      }}/>
      <VisGraph<ExtendedNodeDatum, LinkDatum>
        data={data as { nodes: ExtendedNodeDatum[]; links?: LinkDatum[] }}
        nodeFill={(n: ExtendedNodeDatum) => colors[n.i % colors.length].value}
        nodeIcon={(n: ExtendedNodeDatum) => colors[n.i % colors.length].symbol}
        nodeLabel={(n: ExtendedNodeDatum) => colors[n.i % colors.length].type}
        duration={props.duration}
        attributes={{
          [Graph.selectors.node]: {
            visGraphNodeE2eTestId: (d: ExtendedNodeDatum) => `node-${colors[d.i % colors.length].type}`,
          },
        }}
      />
    </VisSingleContainer>
  )
}
