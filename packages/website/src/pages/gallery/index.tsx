import React from 'react'
import Heading from '@theme/Heading'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import Head from '@docusaurus/Head'

// Internal Deps
import { GalleryCard } from '@site/src/components/GalleryCard'

// Examples
import { examples } from '@unovis/shared/examples/examples-list'

// Styles
import s from './index.module.css'

export default function Home (): JSX.Element {
  return (
    <Layout
      title="Gallery"
      description="Explore the gallery of Unovis examples"
    >
      <Head><link rel="alternate" type="text/plain" title="Unovis chart creation prompts" href="/llm.txt" /></Head>
      <div className={s.root}>
        <div className={s.header}>
          <h1>Gallery</h1>
          <Link className={s.moreExamples} to="https://unovis.dev/examples">More Examples</Link>
        </div>
        { examples.map(collection => <div key={collection.title} className={s.collectionTitle}>
          <Heading as='h2' id={collection.title}>{collection.title}</Heading>
          <div className={s.collectionDescription}>{collection.description}</div>
          <div className={s.collectionItems}>
            { collection.examples.map(example =>
              <Link className={s.linkedCard} key={example.pathname} to={`/gallery/view?collection=${encodeURIComponent(collection.title)}&example=${example.pathname}`}>
                <GalleryCard title={example.title} kicker={example.kicker} src={example.preview} srcDark={example.previewDark}/>
              </Link>
            )}
          </div>
        </div>
        )}
        <div className={s.banner}>
          🤔 Can't find the example you're looking for? Check out our gallery of React examples that we use for Unovis development at <Link to="https://unovis.dev/examples">unovis.dev/examples</Link>.
        </div>
      </div>
    </Layout>
  )
}
