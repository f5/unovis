import React from 'react'
import { VisSingleContainer, VisGraph } from '@unovis/react'
import { TrimMode } from '@unovis/ts'
import { generateNodeLinkData, NodeDatum, LinkDatum, randomNumberGenerator } from '@src/utils/data'
import { sample } from '@src/utils/array'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Node Labels and Sub-labels'
export const subTitle = 'Trimming'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const data = generateNodeLinkData(15)
  const regions = ['Australian', 'South American', 'Siberian', 'European', 'Asian']
  const colors = ['Vermilion', 'Verdigris', 'Bisque', 'Cattleya']
  const animals = ['Elephant', 'Mountain Lionnnnnnnnnnnnnnnnnnnnnnnnnn', 'Sea Otter', 'Bear']
  const trimModes = Object.values(TrimMode)
  const labels = data.nodes.map((d, i) => ({
    label: `${sample(animals)} ${sample(colors)}`,
    subLabel: `${sample(regions)} ${sample(colors)} ${sample(animals)}`,
    labelTrim: randomNumberGenerator() > 0.2,
    labelTrimMode: sample(trimModes),
    labelTrimLength: Math.round(3 + 12 * randomNumberGenerator()),
    subLabelTrim: randomNumberGenerator() > 0.2,
    subLabelTrimMode: sample(trimModes),
    subLabelTrimLength: Math.round(3 + 12 * randomNumberGenerator()),
    labelWrap: randomNumberGenerator() > 0.5,
    labelWrapLength: 120,
    subLabelWrap: randomNumberGenerator() > 0.5,
    subLabelWrapLength: 40,
  }))
  return (
    <VisSingleContainer data={data} height={600}>
      <VisGraph<NodeDatum, LinkDatum>
        nodeLabel={(_, i) => labels[i].label}
        nodeLabelTrim={(_, i) => labels[i].labelTrim}
        nodeLabelWrap={(_, i) => labels[i].labelWrap}
        nodeLabelWidth={(_, i) => labels[i].labelWrapLength}
        nodeLabelWrapSeparator={[' ']}
        nodeLabelTrimMode={(_, i) => labels[i].labelTrimMode}
        nodeLabelTrimLength={(_, i) => labels[i].labelTrimLength}
        nodeSubLabel={(_, i) => labels[i].subLabel}
        nodeSubLabelWrap={(_, i) => labels[i].subLabelWrap}
        nodeSubLabelWidth={(_, i) => labels[i].subLabelWrapLength}
        nodeSubLabelTrim={(_, i) => labels[i].subLabelTrim}
        nodeSubLabelTrimMode={(_, i) => labels[i].subLabelTrimMode}
        nodeSubLabelTrimLength={(_, i) => labels[i].subLabelTrimLength}
        nodeSubLabelForceWordBreak={true}
        duration={props.duration}
      />
    </VisSingleContainer>
  )
}

