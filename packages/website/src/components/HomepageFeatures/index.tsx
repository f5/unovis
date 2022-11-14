import React from 'react'
import clsx from 'clsx'

// Style
import styles from './index.module.css'

type FeatureItem = {
  title: string;
  image: string;
  description: JSX.Element;
};

export const FeatureList: FeatureItem[] = [
  {
    title: 'Framework Independent',
    image: 'img/unovis-image-1.svg',
    description: (
      <>
        Use with React, Angular, Svelte,<br /> or without any UI framework.
      </>
    ),
  },
  {
    title: 'Smooth',
    image: 'img/unovis-image-2.svg',
    description: (
      <>
        We pay attention to how the library components look and how they react to
        data changes. Styles are customizable via CSS variables.
      </>
    ),
  },
  // {
  //   title: 'Modular',
  //   image: 'img/unovis-image-2.svg',
  //   description: (
  //     <>
  //       Unovis is modular, which means you can assemble complex unique charts
  //       from a library of components.
  //     </>
  //   ),
  // },
  {
    title: 'Built with Typescript',
    image: 'img/unovis-image-3.svg',
    description: (
      <>
        Unovis is built with Typescript and allows you to import
        individual component modules to reduce your app bundle size.
      </>
    ),
  },
]

export function Feature ({ title, image, description }: FeatureItem): JSX.Element {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img className={styles.featureSvg} alt={title} src={image} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  )
}

export function HomepageFeatures (): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container" >
        <div className="row" >
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  )
}
