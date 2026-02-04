import React, { useCallback, useMemo, useEffect } from 'react'
import { VisAnnotations, VisSingleContainer, VisNestedDonut } from '@unovis/react'
import { Annotations, StringAccessor } from '@unovis/ts'
import { ExampleViewerDurationProps } from '@/utils/data'

export const title = 'Single Container'
export const subTitle = 'Donut with annotation button'

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const data = [
    { group: 'A', subgroup: 'A0', value: 10 },
    { group: 'A', subgroup: 'A0', value: 5 },
    { group: 'A', subgroup: 'A1', value: 2 },
    { group: 'A', subgroup: 'A1', value: 1 },
    { group: 'A', subgroup: 'A1', value: 1 },
    { group: 'A', subgroup: 'A2', value: 15 },
    { group: 'B', value: 15 },
    { group: 'C', subgroup: 'C0', value: 3 },
    { group: 'C', subgroup: 'C1', value: 1 },
  ]
  type Datum = typeof data[0]
  const height = 250
  const [annotations, setAnnotations] = React.useState<AnnotationItem[]>([])
  const [layers, setLayers] = React.useState<StringAccessor<Datum>[]>()
  const [expanded, setExpandedState] = React.useState(false)

  useEffect(() => {
    setAnnotations([{
      x: '50%',
      y: height / 2 + 15 + 8,
      cursor: 'pointer',
      textAlign: 'center',
      content: { text: expanded ? 'Hide' : 'Show', color: '#3355ee', fontSize: 11 },
    }])
    if (expanded) {
      setLayers([d => d.group, d => d.subgroup ?? null])
    } else {
      setLayers([d => d.group])
    }
  }, [expanded])

  const events = useMemo(() => ({
    [Annotations.selectors.annotationContent]: {
      click: () => setExpandedState(!expanded),
    },
  }), [expanded])
  return (
    <>
      <VisSingleContainer data={data} height={height}>
        <VisNestedDonut
          showBackground={true}
          layers={layers}
          value={useCallback((d: Datum) => d.value, [])}
          layerSettings={{ width: expanded ? 25 : 50 }}
          showSegmentLabels={false}
          centralLabel={'Label Text'} centralSubLabel={'Sub-label'}
          duration={props.duration}/>
        <VisAnnotations events={events} items={annotations} duration={props.duration}/>
      </VisSingleContainer>
    </>
  )
}

