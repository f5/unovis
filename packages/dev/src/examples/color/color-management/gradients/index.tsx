import React, { useState } from 'react'
import {
  VisXYContainer,
  VisSingleContainer,
  VisArea,
  VisStackedBar,
  VisGroupedBar,
  VisTimeline,
  VisDonut,
  VisNestedDonut,
  VisRadialBar,
  VisTreemap,
  VisSankey,
  VisBulletLegend,
  VisAxis,
} from '@unovis/react'
import { CurveType, Gradient, GradientUnits, NumericAccessor, Orientation } from '@unovis/ts'

import { XYDataRecord, NestedDatum, TimeDataRecord, generateXYDataRecords, generateNestedData, generateTimeSeries } from '@src/utils/data'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'

export const title = 'Gradients'
export const subTitle = 'Gradient fills across chart types'

// Recipes mirroring the ones the Exaforce webui ships today
const areaGradient: Gradient = { stops: [{ offset: 0, opacity: 0.5 }, { offset: 1, opacity: 0.1 }] }
const barGradient: Gradient = { stops: [{ offset: 0, opacity: 0.85 }, { offset: 1, opacity: 0.5 }] }
const plotGradient: Gradient = { ...barGradient, units: GradientUnits.UserSpaceOnUse }
const funnelGradient: Gradient = { stops: [{ offset: 0, opacity: 0.5 }, { offset: 1, opacity: 0.15 }] }
const timelineGradient: Gradient = { stops: [{ offset: 0, opacity: 0.95 }, { offset: 1, opacity: 0.6 }] }
const treemapGradient: Gradient = { stops: [{ offset: 0, opacity: 0.95 }, { offset: 1, opacity: 0.9, colorShift: 0.2 }] }
const sankeyNodeGradient: Gradient = { stops: [{ offset: 0, opacity: 1 }, { offset: 1, opacity: 0.75 }] }

const seriesAccessors: NumericAccessor<XYDataRecord>[] = [
  (d: XYDataRecord) => d.y,
  (d: XYDataRecord) => d.y1,
  (d: XYDataRecord) => d.y2,
]

type WaterfallDatum = { x: number; start: number; delta: number }
const waterfallData: WaterfallDatum[] = [12, 7, -5, 9, -11, 4, -3, 8].reduce((acc, delta, i) => {
  const start = i ? acc[i - 1].start + acc[i - 1].delta : 0
  return [...acc, { x: i, start, delta }]
}, [] as WaterfallDatum[])

type FunnelDatum = { step: number; value: number }
const funnelData: FunnelDatum[] = [100, 72, 72, 48, 48, 31, 31, 18].map((value, step) => ({ step, value }))

type DonutDatum = { key: string; value: number }
const donutData: DonutDatum[] = [
  { key: 'Critical', value: 14 },
  { key: 'High', value: 32 },
  { key: 'Medium', value: 41 },
  { key: 'Low', value: 23 },
]

type RadialBarDatum = { key: string; value: number }
const radialBarData: RadialBarDatum[] = [
  { key: 'Triaged', value: 82 },
  { key: 'Investigated', value: 64 },
  { key: 'Resolved', value: 41 },
]

type TreemapDatum = { name: string; value: number; group: string }
const treemapData: TreemapDatum[] = [
  { name: 'Okta', value: 34, group: 'Identity' },
  { name: 'Entra ID', value: 21, group: 'Identity' },
  { name: 'Google', value: 9, group: 'Identity' },
  { name: 'AWS', value: 28, group: 'Cloud' },
  { name: 'GCP', value: 14, group: 'Cloud' },
  { name: 'Azure', value: 11, group: 'Cloud' },
  { name: 'GitHub', value: 17, group: 'SaaS' },
  { name: 'Slack', value: 8, group: 'SaaS' },
  { name: 'Jira', value: 6, group: 'SaaS' },
]

type SankeyNode = { id: string; label: string; color: string }
type SankeyLink = { source: string; target: string; value: number }
const sankeyData: { nodes: SankeyNode[]; links: SankeyLink[] } = {
  nodes: [
    { id: 'alerts', label: 'Alerts', color: 'var(--vis-color0)' },
    { id: 'auto', label: 'Auto-closed', color: 'var(--vis-color1)' },
    { id: 'triage', label: 'Triaged', color: 'var(--vis-color2)' },
    { id: 'benign', label: 'Benign', color: 'var(--vis-color3)' },
    { id: 'incident', label: 'Incident', color: 'var(--vis-color4)' },
  ],
  links: [
    { source: 'alerts', target: 'auto', value: 60 },
    { source: 'alerts', target: 'triage', value: 40 },
    { source: 'triage', target: 'benign', value: 28 },
    { source: 'triage', target: 'incident', value: 12 },
  ],
}

const nestedData = generateNestedData(60, 3)
const xyData = generateXYDataRecords(12)
const timelineData = generateTimeSeries(16, 5, 6)
const legendItems = ['Series A', 'Series B', 'Series C'].map(name => ({ name }))

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
  gap: 20,
  margin: '12px 24px 24px',
}

const cardStyle: React.CSSProperties = {
  border: '1px solid #e2e2e2',
  borderRadius: 8,
  padding: 12,
}

const labelStyle: React.CSSProperties = {
  margin: '0 0 8px',
  font: '600 13px/1.2 Inter, sans-serif',
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const ChartCard = ({ label, children }: { label: string; children: React.ReactNode }): React.ReactElement => (
  <div style={cardStyle}>
    <p style={labelStyle}>{label}</p>
    {children}
  </div>
)

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [enabled, setEnabled] = useState(true)
  const g = <T extends Gradient | boolean>(gradient: T): T | undefined => enabled ? gradient : undefined
  const x = (d: XYDataRecord): number => d.x

  return (<>
    <label style={{ margin: '0 24px', font: '13px Inter, sans-serif' }}>
      <input type='checkbox' checked={enabled} onChange={e => setEnabled(e.target.checked)}/> Gradient fills
    </label>
    <div style={gridStyle}>
      <ChartCard label='Area — 0.5 → 0.1, solid outline'>
        <VisXYContainer<XYDataRecord> data={xyData} height={220}>
          <VisArea x={x} y={seriesAccessors} line gradient={g(areaGradient)} duration={props.duration}/>
          <VisAxis type='x' numTicks={5} duration={props.duration}/>
          <VisAxis type='y' duration={props.duration}/>
        </VisXYContainer>
      </ChartCard>

      <ChartCard label='Stacked Bar — per segment (bounding box)'>
        <VisXYContainer<XYDataRecord> data={xyData} height={220}>
          <VisStackedBar x={x} y={seriesAccessors} gradient={g(barGradient)} duration={props.duration}/>
          <VisAxis type='x' numTicks={5} duration={props.duration}/>
          <VisAxis type='y' duration={props.duration}/>
        </VisXYContainer>
      </ChartCard>

      <ChartCard label='Stacked Bar — plot-wide fade (userSpaceOnUse)'>
        <VisXYContainer<XYDataRecord> data={xyData} height={220}>
          <VisStackedBar x={x} y={seriesAccessors} gradient={g(plotGradient)} duration={props.duration}/>
          <VisAxis type='x' numTicks={5} duration={props.duration}/>
          <VisAxis type='y' duration={props.duration}/>
        </VisXYContainer>
      </ChartCard>

      <ChartCard label='Stacked Bar — horizontal (fades towards the base)'>
        <VisXYContainer<XYDataRecord> data={xyData.slice(0, 7)} height={220}>
          <VisStackedBar x={x} y={seriesAccessors} orientation={Orientation.Horizontal} gradient={g(barGradient)} duration={props.duration}/>
          <VisAxis type='x' duration={props.duration}/>
          <VisAxis type='y' duration={props.duration}/>
        </VisXYContainer>
      </ChartCard>

      <ChartCard label='Grouped Bar'>
        <VisXYContainer<XYDataRecord> data={xyData.slice(0, 6)} height={220}>
          <VisGroupedBar x={x} y={seriesAccessors} gradient={g(barGradient)} duration={props.duration}/>
          <VisAxis type='x' numTicks={6} duration={props.duration}/>
          <VisAxis type='y' duration={props.duration}/>
        </VisXYContainer>
      </ChartCard>

      <ChartCard label='Waterfall (Stacked Bar + baseline), sign colors'>
        <VisXYContainer<WaterfallDatum> data={waterfallData} height={220}>
          <VisStackedBar<WaterfallDatum>
            x={d => d.x}
            y={d => d.delta}
            baseline={d => d.start}
            color={d => d.delta >= 0 ? '#2fb67c' : '#e5484d'}
            gradient={g(barGradient)}
            duration={props.duration}
          />
          <VisAxis type='x' numTicks={8} duration={props.duration}/>
          <VisAxis type='y' duration={props.duration}/>
        </VisXYContainer>
      </ChartCard>

      <ChartCard label='Funnel (stepped Area) — 0.5 → 0.15'>
        <VisXYContainer<FunnelDatum> data={funnelData} height={220}>
          <VisArea<FunnelDatum> x={d => d.step} y={d => d.value} curveType={CurveType.Step} line gradient={g(funnelGradient)} duration={props.duration}/>
          <VisAxis type='y' duration={props.duration}/>
        </VisXYContainer>
      </ChartCard>

      <ChartCard label='Timeline — left to right, 0.95 → 0.6'>
        <VisXYContainer<TimeDataRecord> data={timelineData} height={220}>
          <VisTimeline
            lineRow={(d: TimeDataRecord) => d.type as string}
            x={(d: TimeDataRecord) => d.timestamp}
            rowHeight={36}
            lineWidth={14}
            showRowLabels
            gradient={g(timelineGradient)}
            duration={props.duration}
          />
          <VisAxis type='x' numTicks={3} tickFormat={(t: number | Date) => new Date(t).toLocaleDateString()} duration={props.duration}/>
        </VisXYContainer>
      </ChartCard>

      <ChartCard label='Donut — radial, centred on the donut (default)'>
        <VisSingleContainer<DonutDatum[]> data={donutData} height={220}>
          <VisDonut<DonutDatum> value={d => d.value} arcWidth={44} padAngle={0.02} cornerRadius={3} centralLabel='110' centralSubLabel='alerts' gradient={g(true)} duration={props.duration}/>
        </VisSingleContainer>
      </ChartCard>

      <ChartCard label='Nested Donut — radial per ring (default)'>
        <VisSingleContainer<NestedDatum[]> data={nestedData} height={220}>
          <VisNestedDonut
            layers={[(d: NestedDatum) => d.group, (d: NestedDatum) => d.subgroup]}
            gradient={g(true)}
            duration={props.duration}
          />
        </VisSingleContainer>
      </ChartCard>

      <ChartCard label='Radial Bar — radial per ring (default)'>
        <VisSingleContainer<RadialBarDatum[]> data={radialBarData} height={220}>
          <VisRadialBar<RadialBarDatum>
            value={d => d.value}
            maxValue={100}
            trackWidth={22}
            trackPadding={6}
            cornerRadius={11}
            centralLabel='62%'
            gradient={g(true)}
            duration={props.duration}
          />
        </VisSingleContainer>
      </ChartCard>

      <ChartCard label='Treemap — 0.95 → 0.9, end stop 20% lighter'>
        <VisSingleContainer<TreemapDatum[]> data={treemapData} height={220}>
          <VisTreemap
            value={(d: TreemapDatum) => d.value}
            layers={[(d: TreemapDatum) => d.group, (d: TreemapDatum) => d.name]}
            tilePadding={6}
            tilePaddingTop={20}
            labelInternalNodes
            tileGradient={g(treemapGradient)}
            duration={props.duration}
          />
        </VisSingleContainer>
      </ChartCard>

      <ChartCard label='Sankey — node fade, links source → target color'>
        <VisSingleContainer data={sankeyData} height={220}>
          <VisSankey
            label={(d: SankeyNode) => d.label}
            nodeColor={(d: SankeyNode) => d.color}
            nodeGradient={g(sankeyNodeGradient)}
            linkGradient={g(true)}
            duration={props.duration}
          />
        </VisSingleContainer>
      </ChartCard>

      <ChartCard label='Bullet Legend — gradient bullets'>
        <div style={{ padding: '24px 0' }}>
          <VisBulletLegend items={legendItems.map(item => ({ ...item, gradient: g(barGradient) }))} bulletSize='24px'/>
        </div>
      </ChartCard>
    </div>
  </>)
}
