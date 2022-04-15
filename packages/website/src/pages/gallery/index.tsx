import React from 'react'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'

// Internal Deps
import { GalleryCard } from '@site/src/components/GalleryCard'

// Examples
import { examples } from '@site/src/examples/examples-list'

// Styles
import s from './index.module.css'

export default function Home (): JSX.Element {
  return (
    <Layout
      title="Gallery"
    >
      <div className={s.root}>
        <h1>Gallery</h1>
        { examples.map(collection => <div key={collection.title}>
          <div className={s.collectionTitle}>{collection.title}</div>
          <div className={s.collectionDescription}>{collection.description}</div>
          { collection.examples.map(example =>
            <Link className={s.linkedCard} to={`/gallery/view?title=${example.title}`} key={example.title}>
              <GalleryCard title={example.title} imageUrl={example.preview}/>
            </Link>
          )}
        </div>
        )}
      </div>
    </Layout>
  )
}
