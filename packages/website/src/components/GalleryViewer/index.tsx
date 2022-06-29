import React, { useEffect } from 'react'
import Tabs from '@theme/Tabs'
import TabItem from '@theme/TabItem'
import CodeBlock from '@theme/CodeBlock'

// Internal Deps
import { kebabCase } from '@site/src/utils/text'
import { Example } from '@site/src/types/example'

// Styles
import s from './styles.module.css'

export type GalleryViewerProps = {
  example: Example;
  useTypescriptCode?: boolean;
}

export function GalleryViewer ({ example, useTypescriptCode }: GalleryViewerProps): JSX.Element {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    if (useTypescriptCode) require(`../../examples/${example.pathname}/${example.pathname}.ts`)
  })

  return (<div className={s.root}>
    <div className={s.title}><h1>{example.title}</h1></div>
    <div className={s.example} id="#vis-container">
      {!useTypescriptCode && example.component()}
    </div>
    <div className={s.description}>{example.description}</div>
    <div className={s.codeBlock}>
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
        <TabItem value="data" label="Data">
          <CodeBlock language="typescript">
            {example.data}
          </CodeBlock>
        </TabItem>
      </Tabs>
    </div>
  </div>)
}
