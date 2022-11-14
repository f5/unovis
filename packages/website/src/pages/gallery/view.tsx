import React from 'react'
import Layout from '@theme/Layout'
import { useLocation } from '@docusaurus/router'
import Link from '@docusaurus/Link'
import BrowserOnly from '@docusaurus/BrowserOnly'

// Internal Deps
import { GalleryViewer } from '@site/src/components/GalleryViewer'

// Examples
import { examples } from '@site/src/examples/examples-list'

// Styles
import s from './index.module.css'

export default function Home (): JSX.Element {
  return (
    <Layout
      title="Gallery"
      description="A modular data visualization framework for React, Angular, Svelte, and vanilla TypeScript or JavaScript"
    >
      <BrowserOnly>{() => {
        const location = useLocation()
        const query = new URLSearchParams(location.search)
        const exampleTitle = query.get('title')
        const useTypescriptCode = query.get('ts') !== null
        const example = (examples.map(c => c.examples)).flat().find(e => e.title === exampleTitle)
        return (
          <div className={s.root}>
            <Link isNavLink={true} to={`/gallery${query.has('category') ? `#${query.get('category')}` : ''}`}>
            ❮ Back to Gallery
            </Link>
            {
              example
                ? <GalleryViewer example={example} useTypescriptCode={useTypescriptCode}/>
                : <div className={s.exampleNotFound}>
                  <h1>Example not found 😢</h1>
                </div>
            }
          </div>
        )
      }}
      </BrowserOnly>
    </Layout>
  )
}
