import React from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'
import Layout from '@theme/Layout'
import { useLocation } from '@docusaurus/router'
import Link from '@docusaurus/Link'

// Internal Deps
import { GalleryViewer } from '@site/src/components/GalleryViewer'

// Styles
import s from './index.module.css'

export default function Home (): JSX.Element {
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const exampleTitle = query.get('title')

  return (
    <Layout
      title="Gallery"
      description="A modular data visualization framework for React, Angular and vanilla TypeScript"
    >
      <div className={s.root}>
        <Link to="/gallery">❮ Back to Gallery</Link>
        <BrowserOnly>
          {() => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { examples } = require('@site/src/examples/examples-list')
            const example = (examples.map(c => c.examples)).flat().find(e => e.title === exampleTitle)
            return example
              ? <GalleryViewer example={example} />
              : <div className={s.exampleNotFound}>
                <h1>Example not found 😢</h1>
              </div>
          }}
        </BrowserOnly>
      </div>
    </Layout>
  )
}
