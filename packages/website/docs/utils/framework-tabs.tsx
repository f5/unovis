// Copyright (c) Volterra, Inc. All rights reserved.
import React from 'react'
import Tabs from '@theme/Tabs'
import TabItem from '@theme/TabItem'
import CodeBlock from '@theme/CodeBlock'

export type FrameworkTabProps = {
  angular: { html: string; ts?: string };
  react: string;
  typescript: string;
  hideTabLabels?: boolean;
  showTitles?: boolean;
}

export const FrameworkTabs = ({
  angular,
  react,
  typescript,
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
      <CodeBlock language="html" title={showTitles && 'template.html'}>
        {angular.html}
      </CodeBlock>
    </TabItem>
    <TabItem value="ts" label="Typescript">
      <CodeBlock language="ts" title={showTitles && 'component.ts'}>
        {typescript}
      </CodeBlock>
    </TabItem>
  </Tabs>
)
