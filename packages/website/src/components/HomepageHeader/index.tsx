import React, { useEffect, useState } from 'react'
import clsx from 'clsx'
import Link from '@docusaurus/Link'

// Internal Deps
import Background from './background'
import { HERO_AGENT_PROMPT, HERO_COPY_LABELS, HERO_COPY_RESET_DELAY } from './constants'

// Styles
import s from './index.module.css'

export function HomepageHeader (): JSX.Element {
  const [copyStatus, setCopyStatus] = useState<keyof typeof HERO_COPY_LABELS>('idle')

  useEffect(() => {
    if (copyStatus === 'idle') return
    const timeoutId = setTimeout(() => setCopyStatus('idle'), HERO_COPY_RESET_DELAY)
    return () => clearTimeout(timeoutId)
  }, [copyStatus])

  const copyPrompt = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(HERO_AGENT_PROMPT)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('error')
    }
  }

  return (
    <header className={clsx('hero hero--primary', s.heroBanner)}>
      <div className={s.background}><Background /></div>
      <div>
        <img style={{ maxWidth: '95%' }} src="img/unovis-logo.svg"/>
        <p className="hero__subtitle">Handcrafted, agentic-ready, themeable, modular, lightweight charts</p>
        <div className={s.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Get Started
          </Link>
          <button className={clsx('button button--secondary button--lg', s.promptButton)} onClick={copyPrompt} title="Copies a prompt that asks a coding agent to add Unovis to your project">
            <span role="status" aria-live="polite">{HERO_COPY_LABELS[copyStatus]}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
