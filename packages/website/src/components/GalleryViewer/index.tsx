import React, { useEffect } from 'react'
import Tabs from '@theme/Tabs'
import TabItem from '@theme/TabItem'
import CodeBlock from '@theme/CodeBlock'

// Internal Deps
import { Example } from '@site/src/types/example'
import { Framework } from '@site/src/types/code'

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
    <div className={s.title}>
      <h1>{example.title}</h1>
    </div>
    <div className={s.example} id="vis-container">
      {!useTypescriptCode && example.component()}
    </div>
    <div className={s.description}>{example.description}</div>
    <div className={s.codeBlock}>
      <Tabs groupId='framework' example={example}>
        <TabItem value={Framework.React} label="React">
          <CodeBlock language="tsx">
            {example.codeReact}
          </CodeBlock>
        </TabItem>
        <TabItem value={Framework.Angular} label="Angular">
          <CodeBlock language="html" title={`${example.pathname}.html`}>
            {example.codeAngular.html}
          </CodeBlock>
          <CodeBlock language="ts" title={`${example.pathname}.component.ts`}>
            {example.codeAngular.component}
          </CodeBlock>
          <CodeBlock language="ts" title={`${example.pathname}.module.ts`}>
            {example.codeAngular.module}
          </CodeBlock>
        </TabItem>
        <TabItem value={Framework.Svelte} label="Svelte">
          <CodeBlock language="html">
            {example.codeSvelte}
          </CodeBlock>
        </TabItem>
        <TabItem value={Framework.TypeScript} label="TypeScript">
          <CodeBlock language="ts">
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
