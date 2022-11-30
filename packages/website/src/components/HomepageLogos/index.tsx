import React from 'react'
import Link from '@docusaurus/Link'
import ThemedImage from '@theme/ThemedImage'
import s from './index.module.css'

type Logo = {
  url: string;
  alt: string;
  src: string;
  srcDark?: string;
}

const logos: Logo[] = [
  { src: 'logo/f5.svg', url: 'https://www.f5.com/', alt: 'F5 Logo' },
  { src: 'logo/nginx.svg', srcDark: 'logo/nginx-dark.svg', url: 'https://www.nginx.com/', alt: 'NGIX Logo' },
]

export function HomepageLogos (): JSX.Element {
  return (
    <section className={s.root}>
      <h3 className={s.heading}>Who's using Unovis?</h3>
      <div className={s.container}>
        {logos.map(logo => (
          <Link to={logo.url} className={s.logo}>
            <ThemedImage
              sources={{ light: logo.src, dark: logo.srcDark || logo.src }}
              alt={logo.alt}
            />
          </Link>
        ))}
      </div>
    </section>
  )
}
