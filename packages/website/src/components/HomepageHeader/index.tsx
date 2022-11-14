import React from 'react'
import clsx from 'clsx'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

// Internal Deps
import Background from './background'

// Styles
import s from './index.module.css'

export function HomepageHeader (): JSX.Element {
  const { siteConfig } = useDocusaurusContext()
  return (
    <header className={clsx('hero hero--primary', s.heroBanner)}>
      <div className={s.background}><Background /></div>
      <div>
        <img style={{ maxWidth: '95%' }} src="img/unovis-logo.svg"/>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={s.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  )
}
