import React from 'react'
import Link from '@docusaurus/Link'

type DocCardItem = {
  href: string;
  id: string;
  label: string;
}
type DocCardWrapperProps = {
  item: DocCardItem & {
    items: DocCardItem[];
  };
}

export default function DocCardWrapper (props: DocCardWrapperProps): JSX.Element {
  const { items, label } = props.item
  return (
    <>
      <h2>{label}</h2>
      {items.map((i, index) => (
        <Link key={`${i.id}-${index}`} href={i.href}>
          <div>{i.label}</div>
        </Link>
      ))}
    </>
  )
}
