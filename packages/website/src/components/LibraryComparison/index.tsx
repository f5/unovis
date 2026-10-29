import React, { ReactNode, useMemo, useState } from 'react'
import clsx from 'clsx'
import { useColorMode } from '@docusaurus/theme-common'
import CodeBlock from '@theme/CodeBlock'

// Internal Deps
import type { Comparison } from '@site/src/comparisons/types'
import { COMPARISON_CHART_HEIGHT, COMPARISON_INITIAL_SEED } from '@site/src/comparisons/constants'
import { ChartCard } from './chart-card'
import { UnavailableCard } from './unavailable-card'
import { TextWithCode } from './text-with-code'

// Styles
import s from './styles.module.css'

export type LibraryComparisonProps<Data> = {
  comparison: Comparison<Data>;
  /** The page title and description, kept on screen with the toolbar while the charts scroll */
  children?: ReactNode;
}

export function LibraryComparison<Data> ({ comparison, children }: LibraryComparisonProps<Data>): JSX.Element {
  const [seed, setSeed] = useState(COMPARISON_INITIAL_SEED)
  const [showData, setShowData] = useState(false)
  const [preset, setPreset] = useState<string | undefined>()
  const activePreset = comparison.presets?.find(p => p.id === preset)
  const data = useMemo(() => comparison.getData(seed), [comparison, seed])
  const isDark = useColorMode().colorMode === 'dark'
  const height = comparison.chartHeight ?? COMPARISON_CHART_HEIGHT

  return (
    <div className={s.root}>
      <div className={s.header}>
        {children}
        <div className={s.toolbar}>
          <button className={clsx(s.button, s.primaryButton)} onClick={() => setSeed(seed + 1)}>
            ↻ {comparison.updateLabel ?? 'Randomize data'}
          </button>
          <button className={s.button} onClick={() => setShowData(!showData)} aria-expanded={showData}>
            {showData ? 'Hide the data' : 'Show the data'}
          </button>
          <span className={s.hint}>{comparison.hint ?? 'Hover the charts, click the legends, switch the site theme or resize the window'}</span>
        </div>
        {comparison.presets && (
          <div className={s.presets}>
            <button className={clsx(s.button, s.presetButton, !preset && s.presetButtonActive)} onClick={() => setPreset(undefined)}>Default</button>
            {comparison.presets.map(p => (
              <button key={p.id} className={clsx(s.button, s.presetButton, preset === p.id && s.presetButtonActive)} onClick={() => setPreset(p.id)}>{p.label}</button>
            ))}
            <span className={s.hint}>{activePreset ? <TextWithCode text={activePreset.description}/> : 'Pick a preset to reconfigure every chart'}</span>
          </div>
        )}
      </div>
      {showData && <CodeBlock className={s.code} language="ts" title="data.ts">{comparison.dataCode}</CodeBlock>}
      <div className={s.grid}>
        {comparison.implementations.map(implementation => (
          <ChartCard
            key={implementation.library}
            implementation={implementation}
            data={data}
            isDark={isDark}
            preset={preset}
            height={height}
            wide={comparison.wide}
          />
        ))}
        {comparison.unsupported?.map(item => (
          <UnavailableCard key={item.library} item={item} height={comparison.wide ? COMPARISON_CHART_HEIGHT : height}/>
        ))}
      </div>
    </div>
  )
}
