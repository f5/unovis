import React from 'react'
import Link from '@docusaurus/Link'
import ThemedImage from '@theme/ThemedImage'
import s from './index.module.css'

type Logo = {
  url: string;
  alt: string;
  src: string;
  srcDark?: string;
  height?: string;
}

const logos: Logo[] = [
  { src: 'logo/f5.svg', url: 'https://www.f5.com/', alt: 'F5 Logo' },
  { src: 'logo/nginx.svg', srcDark: 'logo/nginx-dark.svg', url: 'https://www.nginx.com/', alt: 'NGIX Logo' },
  { src: 'logo/exaforce.svg', srcDark: 'logo/exaforce-dark.svg', url: 'https://www.exaforce.com/', alt: 'Exaforce Logo' },
  { src: 'logo/shadcn-vue.svg', url: 'https://www.shadcn-vue.com/', alt: 'Shadcn Vue Logo' },
  { src: 'logo/nuxt.svg', srcDark: 'logo/nuxt-dark.svg', url: 'https://nuxtcharts.com/', alt: 'Nuxt Charts Logo', height: '40px' },
]

export function HomepageLogos (): JSX.Element {
  return (
    <section className={s.root}>
      <h1>Companies using Unovis</h1>
      <div className={s.container}>
        {logos.map(logo => (
          <Link
            key={logo.url}
            to={logo.url}
            className={s.logo}
            style={{ '--logo-height': logo.height ?? '70px' } as React.CSSProperties}
          >
            <ThemedImage
              className={s.logoImage}
              sources={{ light: logo.src, dark: logo.srcDark || logo.src }}
              alt={logo.alt}
            />
          </Link>
        ))}
      </div>
    </section>
  )
}
