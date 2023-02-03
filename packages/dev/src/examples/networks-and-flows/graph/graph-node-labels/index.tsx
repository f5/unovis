import React from 'react'
import { VisSingleContainer, VisGraph } from '@unovis/react'
import { TrimMode } from '@unovis/ts'
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
  const trimModes = Object.values(TrimMode)
  const labels = data.nodes.map((d, i) => ({
    label: `${sample(animals)} ${sample(colors)}`,
    subLabel: `${sample(regions)} ${sample(colors)} ${sample(animals)}`,
    labelTrim: Math.random() > 0.2,
    labelTrimMode: sample(trimModes),
    labelTrimLength: Math.round(3 + 12 * Math.random()),
    subLabelTrim: Math.random() > 0.2,
    subLabelTrimMode: sample(trimModes),
    subLabelTrimLength: Math.round(3 + 12 * Math.random()),
  }))
  return (
    <VisSingleContainer data={data} height={600}>
      <VisGraph<NodeDatum, LinkDatum>
        nodeLabel={(_, i) => labels[i].label}
        nodeLabelTrim={(_, i) => labels[i].labelTrim}
        nodeLabelTrimMode={(_, i) => labels[i].labelTrimMode}
        nodeLabelTrimLength={(_, i) => labels[i].labelTrimLength}
        nodeSubLabel={(_, i) => labels[i].subLabel}
        nodeSubLabelTrim={(_, i) => labels[i].subLabelTrim}
        nodeSubLabelTrimMode={(_, i) => labels[i].subLabelTrimMode}
        nodeSubLabelTrimLength={(_, i) => labels[i].subLabelTrimLength}
      />
    </VisSingleContainer>
  )
}

