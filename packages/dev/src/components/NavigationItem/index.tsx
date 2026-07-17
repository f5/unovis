import React from 'react'
import { Link } from 'react-router-dom'

// Styles
import s from './style.module.css'

export type NavigationItemProps = {
  title: string;
  group: string;
  subTitle?: string;
  isActive?: boolean;
  preservedSearch?: string;
}

export const NavigationItem = React.forwardRef<HTMLDivElement, NavigationItemProps>(function navigationItem (props, ref) {
  const to = {
    pathname: `examples/${props.group}/${props.title}`,
    search: props.preservedSearch || undefined,
  }
  return (
    <div ref={ref} className={`${s.navItem}${props.isActive ? ` ${s.navItemActive}` : ''}`}>
      <Link to={to}>
        <div className={s.navItemTitle}>{props.title}</div>
        <div className={s.navItemSubTitle}> {props.subTitle}</div>
      </Link>
    </div>
  )
})
