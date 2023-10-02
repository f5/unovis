// Copyright (c) Volterra, Inc. All rights reserved.
import React from 'react'
import Tabs from '@theme/Tabs'
import TabItem from '@theme/TabItem'
import CodeBlock from '@theme/CodeBlock'

export type FrameworkTabProps = {
  angular: { html?: string; ts?: string };
  react: string;
  svelte: string;
  vue: string;
  typescript?: string;
  javascript?: string;
  hideTabLabels?: boolean;
  showTitles?: boolean;
}

export const FrameworkTabs = ({
  angular,
  react,
  svelte,
  vue,
  typescript,
  javascript,
  hideTabLabels,
  showTitles,
}: FrameworkTabProps): JSX.Element => (
  <Tabs groupId="framework" className={hideTabLabels ? 'hidden' : ''}>
    <TabItem value="react" label="React">
      <CodeBlock language="jsx" title={showTitles && 'component.tsx'}>
        {react}
      </CodeBlock>
    </TabItem>
    <TabItem value="angular" label="Angular">
      {angular.ts !== undefined &&
        <CodeBlock language="ts" title={showTitles && 'component.ts'}>
          {angular.ts}
        </CodeBlock>
      }
      {angular.html !== undefined &&
        <CodeBlock language="html" title={showTitles && 'template.html'}>
          {angular.html}
        </CodeBlock>
      }
    </TabItem>
    <TabItem value="svelte" label="Svelte">
      <CodeBlock language="html" title={showTitles && 'component.svelte'}>
        {svelte}
      </CodeBlock>
    </TabItem>
    <TabItem value="vue" label="Vue">
      <CodeBlock language="html" title={showTitles && 'component.vue'}>
        {vue}
      </CodeBlock>
    </TabItem>
    <TabItem value="ts" label={typescript ? 'TypeScript' : 'JavaScript'}>
      <CodeBlock language="ts" title={showTitles && `component.${typescript ? 'ts' : 'js'}`}>
        {typescript || javascript}
      </CodeBlock>
    </TabItem>
  </Tabs>
)
