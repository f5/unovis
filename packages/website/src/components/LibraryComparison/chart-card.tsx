import React, { lazy, Suspense, useMemo, useState } from 'react'
import clsx from 'clsx'
import BrowserOnly from '@docusaurus/BrowserOnly'
import CodeBlock from '@theme/CodeBlock'

// Internal Deps
import type { ComparisonImplementation } from '@site/src/comparisons/types'
import { libraries } from '@site/src/comparisons/libraries'
import { stripLintDirectives } from '@site/src/comparisons/utils/code'
import { ChartErrorBoundary } from './error-boundary'

// Styles
import s from './styles.module.css'

export type ChartCardProps<Data> = {
  implementation: ComparisonImplementation<Data>;
  data: Data;
  isDark: boolean;
  /** The active preset's id, passed to the chart unless the library can't draw it */
  preset?: string;
  height: number;
  /** Span the full width of the grid */
  wide?: boolean;
}

export function ChartCard<Data> ({ implementation, data, isDark, preset, height, wide }: ChartCardProps<Data>): JSX.Element {
  const library = libraries[implementation.library]
  const [showCode, setShowCode] = useState(false)
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const Chart = useMemo(() => lazy(implementation.load), [implementation])
  const unsupportedPreset = preset ? implementation.unsupportedPresets?.[preset] : undefined

  return (
    <article className={clsx(s.card, library.id === 'unovis' && s.cardUnovis, wide && s.cardWide)}>
      <header className={s.cardHeader}>
        <a className={s.libraryName} href={library.website} target="_blank" rel="noopener noreferrer">{library.name}</a>
        <span className={s.badge}>v{library.version}</span>
        <span className={s.badge}>{implementation.renderer ?? library.renderer}</span>
        <button className={clsx(s.button, s.codeButton)} onClick={() => setShowCode(!showCode)} aria-expanded={showCode}>
          {showCode ? 'Hide code' : 'Code'}
        </button>
      </header>
      <div className={s.chart} style={{ height }}>
        <BrowserOnly fallback={<div className={s.placeholder}/>}>
          {() => (
            <ChartErrorBoundary>
              <Suspense fallback={<div className={s.placeholder}>Loading {library.name}…</div>}>
                <Chart data={data} isDark={isDark} preset={unsupportedPreset ? undefined : preset}/>
              </Suspense>
            </ChartErrorBoundary>
          )}
        </BrowserOnly>
        {unsupportedPreset && (
          <div className={s.presetUnsupported}>
            <div className={s.unavailableTitle}>Not in {library.name}</div>
            <p className={s.unavailableReason}>{unsupportedPreset.reason}</p>
            {unsupportedPreset.url && <a href={unsupportedPreset.url} target="_blank" rel="noopener noreferrer">Source</a>}
          </div>
        )}
      </div>
      {showCode && <CodeBlock className={s.code} language="tsx">{stripLintDirectives(implementation.code)}</CodeBlock>}
    </article>
  )
}
