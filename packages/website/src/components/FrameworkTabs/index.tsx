import React, { createRef, useRef, createContext, useContext, useState, forwardRef } from 'react'
import Tabs from '@theme/Tabs'
import TabItem from '@theme/TabItem'
import CodeBlock from '@theme/CodeBlock'

import { Framework } from '@site/src/types/code'
import { StackblitzButton } from '../StackblitzButton'

export type FrameworkTabsProps = {
  react: string;
  svelte: string;
  typescript: string;
  angular: {
    module?: string;
    component: string;
    template?: string;
  };
  data?: string;
  showStackblitzButton?: boolean;
}

export function FrameworkTabs (props: FrameworkTabsProps): JSX.Element {
  const { react, svelte, typescript, angular, data } = props
  const { showStackblitzButton, ...example } = props
  const [framework, setFramework] = useState()
  return (
    <>
      {showStackblitzButton && <StackblitzButton example={example} framework={framework}/>}
      <Tabs groupId='framework' onChange={setFramework}>
        <TabItem value='React' label='React'>
          <CodeBlock language="tsx" children={react}/>
        </TabItem>
        <TabItem value={Framework.Angular} label="Angular">
          {angular.template && <CodeBlock language="html" children={angular?.template}/>}
          <CodeBlock language="ts" children={angular.component}/>
          {angular.module && <CodeBlock language="ts" children={angular.module}/>}
        </TabItem>
        <TabItem value={Framework.Svelte} label="Svelte">
          <CodeBlock language="html" children={svelte}/>
        </TabItem>
        <TabItem value={Framework.TypeScript} label="TypeScript">
          <CodeBlock language='ts' children={typescript}/>
        </TabItem>
        {data && <TabItem value="data" label="Data">
          <CodeBlock language="typescript">
            {data}
          </CodeBlock>
        </TabItem>}
      </Tabs>
    </>
  )
}
