import React from 'react'
import { VisSingleContainer, VisGraph } from '@unovis/react'
import { FitMode, TrimMode } from '@unovis/ts'
import { generateNodeLinkData, NodeDatum, LinkDatum, randomNumberGenerator } from '@src/utils/data'
import { sample } from '@src/utils/array'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Node Labels and Sub-labels'
export const subTitle = 'Trimming and Wrapping'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const data = generateNodeLinkData(15)
  const regions = ['Australian', 'South American', 'Siberian', 'European', 'Asian']
  const colors = ['Vermilion', 'Verdigris', 'Bisque', 'Cattleya']
  const animals = ['Elephant', 'Mountain Lion', 'Sea Otter', 'Bear', 'Humuhumunukunukuapuaa']
  const trimModes = Object.values(TrimMode)
  const labels = data.nodes.map(() => ({
    label: `${sample(regions)} ${sample(animals)} ${sample(colors)}`,
    subLabel: `${sample(regions)} ${sample(colors)} ${sample(animals)}`,
    fitMode: sample([FitMode.Trim, FitMode.Wrap]),
    labelTrim: randomNumberGenerator() > 0.2,
    labelTrimMode: sample(trimModes),
    labelTrimLength: Math.round(3 + 12 * randomNumberGenerator()),
    subLabelTrim: randomNumberGenerator() > 0.2,
    subLabelTrimMode: sample(trimModes),
    subLabelTrimLength: Math.round(3 + 12 * randomNumberGenerator()),
  }))
  return (
    <VisSingleContainer data={data} height={600}>
      <VisGraph<NodeDatum, LinkDatum>
        nodeLabel={(_, i) => labels[i].label}
        nodeLabelFitMode={(_, i) => labels[i].fitMode}
        nodeLabelWidth={100}
        nodeLabelForceWordBreak
        nodeLabelTrim={(_, i) => labels[i].labelTrim}
        nodeLabelTrimMode={(_, i) => labels[i].labelTrimMode}
        nodeLabelTrimLength={(_, i) => labels[i].labelTrimLength}
        nodeSubLabel={(_, i) => labels[i].subLabel}
        nodeSubLabelFitMode={(_, i) => labels[i].fitMode}
        nodeSubLabelWidth={80}
        nodeSubLabelForceWordBreak
        nodeSubLabelTrim={(_, i) => labels[i].subLabelTrim}
        nodeSubLabelTrimMode={(_, i) => labels[i].subLabelTrimMode}
        nodeSubLabelTrimLength={(_, i) => labels[i].subLabelTrimLength}
        duration={props.duration}
      />
    </VisSingleContainer>
  )
}
