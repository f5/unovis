<script lang='ts'>
  import { VisSingleContainer, VisGraph, VisTooltip, VisBulletLegend } from '@unovis/svelte'
  import { Graph, GraphLayoutType, Scale, colors, GraphLinkArrowStyle, Position } from '@unovis/ts'

  import { data, groups, styleUrl, getFlag, NodeDatum, LinkDatum } from './data'

  const colorScale = Scale.scaleOrdinal<string>(colors).domain(groups)
  const getColor = (d: NodeDatum | LinkDatum['airline']): string => colorScale(d.continent)
  
  const panels = groups.map(c => ({
    nodes: data.nodes.reduce((arr, n) => n.continent === c ? [...arr, n.id] : arr, []),
    label: c,
    borderColor: colorScale(c),
    dashedOutline: true,
    labelPosition: c === 'North America' || c === 'Asia' || c === 'Africa'
      ? Position.Top
      : Position.Bottom
    ,
  }))
  const legendItems = groups.map(d => ({ name: d, color: colorScale(d) }))
  const triggers = {
    [Graph.selectors.link]: l => `
        <div style="color:#333">
          <div>${l.source.label} -> ${l.target.label}</div>
          <div style="font-size:12px">
            ${getFlag(l.airline.countryCode)}${l.airline.name} |
            <span style="font-variant:all-small-caps">${[l.airline.country, l.airline.continent].join(', ')}
          </div>
        </div>`
    ,
  }
  
</script>

<link rel="stylesheet" href={styleUrl}/>

<VisSingleContainer {data} height={750} margin={{ top: 20, bottom: 20, left: 20, right: 20 }}>
  <VisBulletLegend items={legendItems}/>
  <VisGraph
    layoutType={GraphLayoutType.Parallel}
    layoutParallelNodeSubGroup="{n => n.continent}"
    layoutParallelNodesPerColumn={5}
    layoutParallelGroupSpacing={200}
    linkArrow={GraphLinkArrowStyle.Single}
    linkStroke="{d => getColor(d.airline)}"
    nodeFill="{getColor}"
    nodeIcon="{n => n.links.length}"
    {panels}
  />
  <VisTooltip {triggers}/>
</VisSingleContainer>


