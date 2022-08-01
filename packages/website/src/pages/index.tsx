import React from 'react'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Tabs from '@theme/Tabs'
import TabItem from '@theme/TabItem'
import CodeBlock from '@theme/CodeBlock'

// Internal Deps
import { kebabCase } from '@site/src/utils/text'
import { HomepageFeatures } from '@site/src/components/HomepageFeatures'
import { HomepageHeader } from '@site/src/components/HomepageHeader'
import ChartExample from '@site/src/examples/basic-area'

// Styles
import s from './index.module.css'

export default function Home (): JSX.Element {
  const { siteConfig } = useDocusaurusContext()
  const example = ChartExample
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="A modular data visualization framework for React, Angular, Svelte and vanilla TypeScript">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <div className={s.example}>
          <div className={s.visContainer}>
            <div className={s.visualization}>
              <h1>Unovis in action</h1>
              <ChartExample.component />
              <Link className={s.link} to="/gallery">See more examples in Gallery {'->'}</Link>
            </div>
            <div className={s.code}>
              <Tabs>
                <TabItem value="react" label="React">
                  <CodeBlock language="tsx">
                    {example.codeReact}
                  </CodeBlock>
                </TabItem>
                <TabItem value="angular" label="Angular">
                  <CodeBlock language="html" title={`${kebabCase(example.title)}.html`}>
                    {example.codeAngular.html}
                  </CodeBlock>
                  <CodeBlock language="ts" title={`${kebabCase(example.title)}.component.ts`}>
                    {example.codeAngular.component}
                  </CodeBlock>
                  <CodeBlock language="ts" title={`${kebabCase(example.title)}.module.ts`}>
                    {example.codeAngular.module}
                  </CodeBlock>
                </TabItem>
                <TabItem value="svelte" label="Svelte">
                  <CodeBlock language="html">
                    {example.codeSvelte}
                  </CodeBlock>
                </TabItem>
                <TabItem value="typescript" label="TypeScript">
                  <CodeBlock language="tsx">
                    {example.codeTs}
                  </CodeBlock>
                </TabItem>
                <TabItem className={s.limitHeight} value="data" label="Data">
                  <CodeBlock language="typescript">
                    {example.data}
                  </CodeBlock>
                </TabItem>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  )
}
