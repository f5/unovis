/* eslint-disable @typescript-eslint/naming-convention */
import React from 'react'

import { useTabs } from '@docusaurus/theme-common/internal'
import { StackblitzButton } from '@site/src/components/StackblitzButton'
import type { Example } from '@unovis/shared/examples/types'
import Tabs from '@theme-original/Tabs'

type TabProps = {
  children: React.ReactNode[];
  groupId?: string;
  example?: Example;
}

export default function TabsWrapper (props: TabProps): React.ReactElement {
  const groups = useTabs(props)
  const current = groups.selectedValue

  return (
    <>
      {props.groupId === 'framework' && props.example && <StackblitzButton example={props.example} framework={current}/>}
      <Tabs {...props}/>
    </>
  )
}
