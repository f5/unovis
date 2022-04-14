import React from 'react'

// Styles
import s from './styles.module.css'

export type GalleryCardProps = {
  title: string;
  imageUrl: string;
}

export function GalleryCard (props: GalleryCardProps): JSX.Element {
  return (<div className={s.root}>
    <div className={s.image} style={{ backgroundImage: `url(${props.imageUrl})` }}></div>
    <div className={s.title}>{props.title}</div>
  </div>)
}
