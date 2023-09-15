/* eslint-disable @typescript-eslint/naming-convention,import/no-absolute-path,@typescript-eslint/ban-ts-comment */
import React from 'react'

// @ts-ignore
import { useTabs } from '/node_modules/@docusaurus/theme-common/lib/utils/tabsUtils'
import { StackblitzButton } from '@site/src/components/StackblitzButton'
import type { Example } from '@unovis/shared/examples/types'
import Tabs from '@theme-original/Tabs'

type TabProps = {
  children: JSX.Element[];
  groupId?: string;
  example?: Example;
}

export default function TabsWrapper (props: TabProps): JSX.Element {
  const groups = useTabs(props)
  const current = groups.selectedValue

  return (
    <>
      {props.groupId === 'framework' && props.example && <StackblitzButton example={props.example} framework={current}/>}
      <Tabs {...props}/>
    </>
  )
}
