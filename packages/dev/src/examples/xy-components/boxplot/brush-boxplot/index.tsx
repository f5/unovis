import React, { useCallback, useMemo, useState } from 'react'
import { VisXYContainer, VisAxis, VisBrush, VisBoxplot } from '@unovis/react'

import { BoxplotDataRecord, generateBoxplotDataRecords } from '@src/utils/data'
import { Arrangement } from '@unovis/ts'

const data = generateBoxplotDataRecords(40)

export const title = 'Brush & Boxplot'
export const subTitle = 'Navigational chart'

export const component = (): React.ReactNode => {
  const [domain, setDomain] = useState<[number, number]>([0, 6])
  const [duration, setDuration] = useState<number | undefined>(undefined)

  const x = useCallback((d: BoxplotDataRecord) => d.x, [])
  const median = useCallback((d: BoxplotDataRecord) => d.median, [])
  const quartiles = useCallback((d: BoxplotDataRecord) => d.quartiles, [])
  const whiskers = useCallback((d: BoxplotDataRecord) => d.whiskers, [])

  const updateDomain = useCallback((selection: [number, number] | undefined, _: unknown, userDriven: boolean) => {
    if (userDriven && selection) {
      setDuration(0) // Update the main chart immediately (without animation) after the brush event
      setDomain(selection)
    }
  }, [])

  const brushChartMargin = useMemo(() => ({ left: 60, right: 10 }), [])

  return (
    <>
      <VisXYContainer<BoxplotDataRecord> duration={duration} data={data} height={'50vh'} xDomain={domain} scaleByDomain={true}>
        <VisBoxplot x={x} median={median} quartiles={quartiles} whiskers={whiskers} barPadding={0.1} />
        <VisAxis type='x' label='Index' numTicks={Math.min(15, domain[1] - domain[0])} gridLine={false}/>
        <VisAxis type='y' label='Value'/>
      </VisXYContainer>
      <VisXYContainer<BoxplotDataRecord> data={data} height={75} margin={brushChartMargin}>
        <VisBoxplot x={x} median={median} quartiles={quartiles} whiskers={whiskers} />
        <VisBrush selection={domain} onBrush={updateDomain} draggable={true} handlePosition={Arrangement.Outside}/>
        <VisAxis type='x' numTicks={15}/>
      </VisXYContainer>
    </>
  )
}
