import React from 'react'
import Heading from '@theme/Heading'
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
        { examples.map(collection => <div key={collection.title} className={s.collectionTitle}>
          <Heading as='h2' id={collection.title}>{collection.title}</Heading>
          <div className={s.collectionDescription}>{collection.description}</div>
          <div className={s.collectionItems}>
            { collection.examples.map(example =>
              <Link className={s.linkedCard} key={example.title} to={`gallery/view?collection=${collection.title}&title=${example.title}`}>
                <GalleryCard title={example.title} imageUrl={example.preview}/>
              </Link>
            )}
          </div>
        </div>
        )}
      </div>
    </Layout>
  )
}
