import React from 'react'
import BrowserOnly from '@docusaurus/BrowserOnly'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'

// Internal Deps
import { GalleryCard } from '@site/src/components/GalleryCard'

// Styles
import s from './index.module.css'

export default function Home (): JSX.Element {
  return (
    <Layout
      title="Gallery"
    >
      <div className={s.root}>
        <h1>Gallery</h1>
        <BrowserOnly>
          {() => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { examples } = require('@site/src/examples/examples-list')
            return examples.map(collection => <div key={collection.title}>
              <div className={s.collectionTitle}>{collection.title}</div>
              <div className={s.collectionDescription}>{collection.description}</div>
              { collection.examples.map(example =>
                <Link className={s.linkedCard} to={`/gallery/view?title=${example.title}`} key={example.title}>
                  <GalleryCard title={example.title} imageUrl={example.preview}/>
                </Link>
              )}
            </div>
            )
          }}
        </BrowserOnly>
      </div>
    </Layout>
  )
}
