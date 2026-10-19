import { ExampleControls } from '@src/components/ExampleControls'
import { useComponentState } from '@src/components/ExampleControls/useComponentState'
import { useComponentConfig } from '@src/components/ExampleControls/useComponentConfig'
import React from 'react'
import { randomNumberGenerator } from '@src/utils/data'
import { VisSingleContainer, VisCircularBar, VisCircularBarSelectors, VisTooltip } from '@unovis/react'
import type { CircularBarArcDatum } from '@unovis/ts'
import { ExampleViewerDurationProps } from '@src/components/ExampleViewer/index'
import { getCircularBarColor } from '../palette'
import { getCircularBarIcon, circularBarIconStyle } from '../icons'

export const title = 'Circular Bar Playground'
export const subTitle = 'Shape, layout, icon and data controls, including small, zero and missing values'

const maxBarCount = 12

// A regular value, a tiny value, `0`, `null` (missing), then regular values again
const edgeCaseValues: (number | null)[] = [0.8, 0.002, 0, null, 0.5, 0.35, 0.05, 1, 0.65, 0.01, 0.4, 0.9]
const mixedValues: number[] = Array.from({ length: maxBarCount }, (_, i) => 0.35 + 0.65 * Math.abs(Math.sin(1 + 1.7 * i)))
const getRandomValues = (): number[] => Array.from({ length: maxBarCount }, () => randomNumberGenerator())

const dataPresets: { label: string; getValues: () => (number | null)[] }[] = [
  { label: 'Small, zero and missing', getValues: () => edgeCaseValues },
  { label: 'Mixed', getValues: () => mixedValues },
  { label: 'Full', getValues: () => Array(maxBarCount).fill(1) },
  { label: 'Random', getValues: getRandomValues },
]

const angleRanges: Record<string, [number, number] | undefined> = {
  'Full circle, first bar at the top (default)': undefined,
  'Full circle from 12 o’clock': [0, 2 * Math.PI],
  'Top half': [-Math.PI / 2, Math.PI / 2],
  'Three quarters': [-3 * Math.PI / 4, 3 * Math.PI / 4],
  'Reversed full circle': [Math.PI, -Math.PI],
}

type AutoNumber = { auto: boolean; value: number }
type ShapeParams = {
  innerRadius: AutoNumber;
  barPadding: AutoNumber;
  cornerRadius: AutoNumber;
  innerCornerRadius: AutoNumber;
  iconSize: AutoNumber;
}

// Slider ranges are in pixels; the chart radius is about 200px
const shapeControls: { key: keyof ShapeParams; max: number }[] = [
  { key: 'innerRadius', max: 150 },
  { key: 'barPadding', max: 30 },
  { key: 'cornerRadius', max: 100 },
  { key: 'innerCornerRadius', max: 100 },
  { key: 'iconSize', max: 40 },
]

const initialShapeParams: ShapeParams = {
  innerRadius: { auto: true, value: 52 },
  barPadding: { auto: true, value: 6 },
  cornerRadius: { auto: true, value: 24 },
  innerCornerRadius: { auto: true, value: 35 },
  iconSize: { auto: true, value: 16 },
}

const rowStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: '130px 52px 1fr 48px', gap: 8, alignItems: 'center', fontSize: 12, color: '#374151' }

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [barCount, setBarCount] = useComponentState('example', 'barCount', 5)
  const [presetIndex, setPresetIndex] = useComponentState('example', 'presetIndex', 0)
  const [values, setValues] = useComponentState<(number | null)[]>('example', 'values', dataPresets[0].getValues())
  const [barMinLength, setBarMinLength] = useComponentState('circularBar', 'barMinLength', 0)
  const [shape, setShape] = useComponentState<ShapeParams>('example', 'shape', initialShapeParams)
  const [angleRangeKey, setAngleRangeKey] = useComponentState('example', 'angleRangeKey', Object.keys(angleRanges)[0])
  const [showBackground, setShowBackground] = useComponentState('circularBar', 'showBackground', true)
  const [sorted, setSorted] = useComponentState('example', 'sorted', false)
  const [showIcons, setShowIcons] = useComponentState('example', 'showIcons', true)

  const data = values.slice(0, barCount)
  const resolve = (p: AutoNumber): number | undefined => p.auto ? undefined : p.value
  const { config, reset } = useComponentConfig('circularBar', {
    innerRadius: resolve(shape.innerRadius),
    barPadding: resolve(shape.barPadding),
    cornerRadius: resolve(shape.cornerRadius),
    innerCornerRadius: resolve(shape.innerCornerRadius),
    iconSize: resolve(shape.iconSize),
    angleRange: angleRanges[angleRangeKey],
    sortFunction: sorted ? (a: number | null, b: number | null): number => (b ?? -1) - (a ?? -1) : undefined,
    icon: showIcons ? getCircularBarIcon : undefined,
  })
  const effectiveAngleRangeKey = Object.keys(angleRanges).find(key => JSON.stringify(angleRanges[key]) === JSON.stringify(config.angleRange)) ?? 'custom'
  const setShapeParam = (key: keyof ShapeParams, update: Partial<AutoNumber>): void => {
    setShape({ ...shape, [key]: { auto: config[key] === undefined, value: config[key] ?? shape[key].value, ...update } })
    reset([key])
  }
  const selectPreset = (index: number): void => {
    setPresetIndex(index)
    setValues(dataPresets[index].getValues())
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 360 }}>
        <ExampleControls components={['example', 'circularBar']}/>
        <label style={rowStyle}>
          <span>Bars</span>
          <span/>
          <input type="range" min={1} max={maxBarCount} step={1} value={barCount} onChange={e => setBarCount(+e.target.value)}/>
          <span>{barCount}</span>
        </label>
        <label style={rowStyle}>
          <span>Data</span>
          <span/>
          <select value={presetIndex} onChange={e => selectPreset(+e.target.value)}>
            {dataPresets.map((p, i) => <option key={p.label} value={i}>{p.label}</option>)}
          </select>
          {dataPresets[presetIndex].getValues === getRandomValues ? <button onClick={() => setValues(getRandomValues())}>New</button> : <span/>}
        </label>
        <label style={rowStyle}>
          <span>barMinLength</span>
          <span/>
          <input type="range"
            min={Math.min(0, barMinLength ?? 0)}
            max={Math.max(60, barMinLength ?? 60)}
            step={Number.isInteger(barMinLength) ? 1 : 'any'}
            value={barMinLength} onChange={e => setBarMinLength(+e.target.value)}/>
          <span>{barMinLength}px</span>
        </label>
        {shapeControls.map(c => (
          <div key={c.key} style={rowStyle}>
            <span>{c.key}</span>
            <label>
              <input type="checkbox" checked={config[c.key] === undefined} onChange={e => setShapeParam(c.key, { auto: e.target.checked })}/> auto
            </label>
            <input type="range" aria-label={c.key} min={Math.min(0, config[c.key] ?? 0)} max={Math.max(c.max, config[c.key] ?? c.max)}
              step={Number.isInteger(config[c.key] ?? 0) ? 1 : 'any'} value={config[c.key] ?? shape[c.key].value} disabled={config[c.key] === undefined}
              onChange={e => setShapeParam(c.key, { value: +e.target.value })}/>
            <span>{config[c.key] === undefined ? 'auto' : `${config[c.key]}px`}</span>
          </div>
        ))}
        <label style={rowStyle}>
          <span>angleRange</span>
          <span/>
          <select value={effectiveAngleRangeKey} onChange={e => { setAngleRangeKey(e.target.value); reset(['angleRange']) }}>
            {effectiveAngleRangeKey === 'custom' && <option value="custom" disabled>Custom ({config.angleRange?.join(', ')})</option>}
            {Object.keys(angleRanges).map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          <span/>
        </label>
        <label style={rowStyle}>
          <span>showBackground</span>
          <input type="checkbox" checked={showBackground} onChange={e => setShowBackground(e.target.checked)}/>
          <span/>
          <span/>
        </label>
        <label style={rowStyle}>
          <span>Sort descending</span>
          <input type="checkbox" checked={!!config.sortFunction} onChange={e => { setSorted(e.target.checked); reset(['sortFunction']) }}/>
          <span/>
          <span/>
        </label>
        <label style={rowStyle}>
          <span>icon</span>
          <input type="checkbox" checked={!!config.icon} onChange={e => { setShowIcons(e.target.checked); reset(['icon']) }}/>
          <span/>
          <span/>
        </label>
      </div>
      <div style={{ flex: 1, minWidth: 320 }}>
        <VisSingleContainer height={400} style={circularBarIconStyle}>
          <VisCircularBar<number | null>
            value={d => d}
            maxValue={1}
            color={getCircularBarColor}
            data={data}
            duration={props.duration}
            barMinLength={barMinLength}
            innerRadius={resolve(shape.innerRadius)}
            barPadding={resolve(shape.barPadding)}
            cornerRadius={resolve(shape.cornerRadius)}
            innerCornerRadius={resolve(shape.innerCornerRadius)}
            angleRange={angleRanges[angleRangeKey]}
            showBackground={showBackground}
            sortFunction={sorted ? (a, b) => (b ?? -1) - (a ?? -1) : undefined}
            icon={showIcons ? getCircularBarIcon : undefined}
            iconSize={resolve(shape.iconSize)}
          />
          <VisTooltip triggers={{
            [VisCircularBarSelectors.bar]: (d: CircularBarArcDatum<number | null>) => `Bar ${d.index + 1}: ${d.value}`,
          }}
          />
        </VisSingleContainer>
      </div>
    </div>
  )
}
