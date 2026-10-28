import React from 'react'
import Link from '@docusaurus/Link'

// Internal Deps
import { BuildSizeChart } from '@site/src/components/BuildSizeChart'
import { lineChartBuildSizes } from '@site/src/comparisons/build-sizes'
import whyUnovisSidebars from '@site/sidebars-why-unovis'
import { HOMEPAGE_FACTS } from './constants'

// Styles
import s from './index.module.css'

const comparisonCount = (whyUnovisSidebars.sidebar.find(item => typeof item === 'object' && item.type === 'category') as { items: string[] }).items.length
const unovisSize = lineChartBuildSizes.find(d => d.library === 'unovis')
const largerLibraries = lineChartBuildSizes.filter(d => d.gzipKb > unovisSize.gzipKb)
const otherLibraryCount = lineChartBuildSizes.length - 1
const sizeSummary = largerLibraries.length === otherLibraryCount
  ? `the smallest of the ${lineChartBuildSizes.length} libraries we measured`
  : `smaller than ${largerLibraries.length} of the ${otherLibraryCount} other libraries we measured`

export function HomepageWhyUnovis (): JSX.Element {
  return (
    <section className={s.root}>
      <h1>Why Unovis</h1>
      <p className={s.lead}>
        We put Unovis next to eight of the most popular charting libraries in {comparisonCount} side-by-side
        comparisons, with the same data and the code for each. Here is what sets it apart.
      </p>
      <div className={s.grid}>
        {HOMEPAGE_FACTS.map(fact => (
          <div className={s.card} key={fact.title}>
            <h3>{fact.title}</h3>
            <p>{fact.description}</p>
            <Link to={fact.link}>{fact.linkText} →</Link>
          </div>
        ))}
      </div>
      <h2 className={s.subheading}>Bundle size</h2>
      <p>
        The same React line chart in every library, with smooth lines, a legend, a tooltip, a crosshair and animation,
        minified and gzipped. Unovis takes {unovisSize.gzipKb} KB, {sizeSummary}.
      </p>
      <BuildSizeChart/>
      <div className={s.actions}>
        <Link className="button button--primary button--lg" to="/why-unovis">Compare side by side</Link>
        <Link className="button button--secondary button--lg" to="/why-unovis/methodology#bundle-size">How we measured</Link>
      </div>
    </section>
  )
}
