import React from 'react'
import { VisSingleContainer, VisGraph } from '@unovis/react'
import { generateNodeLinkData, NodeDatum, LinkDatum } from '@src/utils/data'
import { sample } from '@src/utils/array'

export const title = 'Node Labels and Sub-labels'
export const subTitle = 'Trimming'
export const category = 'Graph'

export const component = (): JSX.Element => {
  const data = generateNodeLinkData(15)
  const regions = ['Australian', 'South American', 'Siberian', 'European', 'Asian']
  const colors = ['Vermilion', 'Verdigris', 'Bisque', 'Cattleya']
  const animals = ['Elephant', 'Mountain Lion', 'Sea Otter', 'Bear']
  const labels = data.nodes.map((d, i) => ({
    label: `${sample(animals)} ${sample(colors)}`,
    subLabel: `${sample(regions)} ${sample(colors)} ${sample(animals)}`,
    labelTrim: Math.random() > 0.5,
    subLabelTrim: Math.random() > 0.5,
  }))
  return (
    <VisSingleContainer data={data} height={600}>
      <VisGraph<NodeDatum, LinkDatum>
        nodeLabel={(_, i) => labels[i].label}
        nodeLabelTrim={(_, i) => labels[i].labelTrim}
        nodeSubLabel={(_, i) => labels[i].subLabel}
        nodeSubLabelTrim={(_, i) => labels[i].subLabelTrim}
      />
    </VisSingleContainer>
  )
}

