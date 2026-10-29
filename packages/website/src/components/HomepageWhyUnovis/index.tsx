import React from 'react'
import Link from '@docusaurus/Link'

// Internal Deps
import { BuildSizeChart } from '@site/src/components/BuildSizeChart'
import { lineChartBuildSizes } from '@site/src/comparisons/build-sizes'

// Styles
import s from './index.module.css'

const unovisSize = lineChartBuildSizes.find(d => d.library === 'unovis')
const largerLibraries = lineChartBuildSizes.filter(d => d.gzipKb > unovisSize.gzipKb)
const otherLibraryCount = lineChartBuildSizes.length - 1
const sizeSummary = largerLibraries.length === otherLibraryCount
  ? `the smallest of the ${lineChartBuildSizes.length} libraries we measured`
  : `smaller than ${largerLibraries.length} of the ${otherLibraryCount} other libraries we measured`

export function HomepageWhyUnovis (): JSX.Element {
  return (
    <section className={s.root}>
      <h1>Bundle size</h1>
      <p>
        The same chart in every library: <strong>a React line chart with smooth lines, a legend, a tooltip, a crosshair
        and animation</strong>, minified and gzipped. Unovis takes {unovisSize.gzipKb} KB, {sizeSummary}.
      </p>
      <BuildSizeChart/>
      <div className={s.actions}>
        <Link className="button button--primary button--lg" to="/why-unovis">Compare side by side</Link>
        <Link className="button button--secondary button--lg" to="/why-unovis/methodology#bundle-size">How we measured</Link>
      </div>
    </section>
  )
}
