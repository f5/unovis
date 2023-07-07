import React from 'react'
import Tabs from '@theme/Tabs'
import TabItem from '@theme/TabItem'
import CodeBlock from '@theme/CodeBlock'

import { Framework } from '@site/src/types/code'

export type CodeSnippetProps = {
  react: string;
  svelte: string;
  typescript: string;
  angular: {
    module: string;
    component: string;
    template: string;
  };
  data?: string;
}

export function CodeSnippet (props: CodeSnippetProps): JSX.Element {
  return (
    <Tabs groupId='framework'>
      <TabItem value={Framework.React} label="React">
        <CodeBlock language="tsx">
          {props.react}
        </CodeBlock>
      </TabItem>
      <TabItem value={Framework.Angular} label="Angular">
        <CodeBlock language="html">
          {props.angular.template}
        </CodeBlock>
        <CodeBlock language="ts">
          {props.angular.component}
        </CodeBlock>
        <CodeBlock language="ts">
          {props.angular.module}
        </CodeBlock>
      </TabItem>
      <TabItem value={Framework.Svelte} label="Svelte">
        <CodeBlock language="html">
          {props.svelte}
        </CodeBlock>
      </TabItem>
      <TabItem value={Framework.TypeScript} label="TypeScript">
        <CodeBlock language="ts">
          {props.typescript}
        </CodeBlock>
      </TabItem>
      <TabItem value="data" label="Data">
        <CodeBlock language="typescript">
          {props.data}
        </CodeBlock>
      </TabItem>
    </Tabs>
  )
}
