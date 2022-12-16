import React from 'react'
import { Link } from 'react-router-dom'

// Styles
import s from './style.module.css'

export type NavigationItemProps = {
  title: string;
  group: string;
  subTitle?: string;
}

export function NavigationItem (props: NavigationItemProps): JSX.Element {
  return (
    <div className={s.navItem}>
      <Link to={`examples/${props.group}/${props.title}`}>
        <div className={s.navItemTitle}>{props.title}</div>
        <div className={s.navItemSubTitle}> {props.subTitle}</div>
      </Link>
    </div>
  )
}
