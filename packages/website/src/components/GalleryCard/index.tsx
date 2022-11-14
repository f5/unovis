import React from 'react'
import ThemedImage from '@theme/ThemedImage'

// Styles
import s from './styles.module.css'

export type GalleryCardProps = {
  title: string;
  src: string;
  srcDark?: string;
}

export function GalleryCard (props: GalleryCardProps): JSX.Element {
  return (<div className={s.root}>
    <ThemedImage
      className={s.image}
      alt={[props.title, 'preview'].join(' ')}
      sources={{
        light: props.src,
        dark: props.srcDark ?? props.src,
      }}
    />
    <div className={s.title}>{props.title}</div>
  </div>)
}
