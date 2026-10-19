import React, { useState, useEffect } from 'react'
import { randomNumberGenerator } from '@src/utils/data'
import { VisSingleContainer, VisGraph } from '@unovis/react'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import { sample } from '@src/utils/array'
import { usePlayback, PlaybackControl } from '@src/components/PlaybackControl'
import type { GraphCircleLabel } from '@unovis/ts'

export const title = 'Graph: Multiple Link Labels'
export const subTitle = 'Link Label Transitions'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [playing, setPlaying] = usePlayback()
  const getSampleLinkCircleLabels = (): GraphCircleLabel[] => {
    const n = Math.round(randomNumberGenerator() * 5 + 1)
    return Array(n).fill(null).map(() => ({
      text: sample(['👉', '🙂', '👍', '👎', '👋', '👀', '👅', '👄', '👂', '👃', '👁️', '1', '55', '☄️😎', '🎄🥶']),
    }))
  }

  const nodes = [
    { id: 'jdoe@acme.com', icon: '🪐', fillColor: '#DFFAFD', label: 'External User', sublabel: 'jdoe@acme.com' },
    { id: 'AWSReservedSSO_Something', icon: '☄️', fillColor: '#E3DEFC', label: 'Role', sublabel: 'AWSReservedSSO_Something' },
  ]

  const links = [
    { source: 0, target: 1, label: getSampleLinkCircleLabels() },
  ]

  const [data, setData] = useState({ nodes, links })

  // Re-render the component here to test how the link label updates
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      const links = [
        {
          source: 0,
          target: 1,
          label: getSampleLinkCircleLabels(),
        },
      ]

      setData({ nodes, links })
    }, 2000)

    return () => clearInterval(interval)
  }, [playing])

  return (<>
    <PlaybackControl playing={playing} onPlayingChange={setPlaying}/>
    <VisSingleContainer height={600}>
      <VisGraph<typeof nodes[number], typeof links[number]>
        data={data}
        nodeIcon={(n) => n.icon}
        nodeIconSize={18}
        nodeStroke={'none'}
        nodeFill={n => n.fillColor}
        nodeLabel={n => n.label}
        nodeSubLabel={n => n.sublabel}
        layoutType='dagre'
        linkCurvature={1}
        dagreLayoutSettings={{
          rankdir: 'LR',
          ranksep: 300,
          nodesep: 100,
        }}
        linkLabel={(l: typeof links[0]) => l.label}
        duration={props.duration}
      />
    </VisSingleContainer>
  </>
  )
}

