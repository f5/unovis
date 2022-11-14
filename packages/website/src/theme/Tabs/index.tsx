/* eslint-disable @typescript-eslint/naming-convention,import/no-absolute-path,@typescript-eslint/ban-ts-comment */
import React from 'react'

// @ts-ignore
import { useTabGroupChoice } from '/node_modules/@docusaurus/theme-common/lib/contexts/tabGroupChoice'
import { StackblitzButton } from '@site/src/components/StackblitzButton'
import { Example } from '@site/src/types/example'
import Tabs from '@theme-original/Tabs'

type TabProps = {
  children: JSX.Element[];
  groupId?: string;
  example?: Example;
}

export default function TabsWrapper (props: TabProps): JSX.Element {
  const groups = useTabGroupChoice()
  const current = groups.tabGroupChoices.framework

  return (
    <>
      {props.groupId === 'framework' && props.example && <StackblitzButton example={props.example} framework={current}/>}
      <Tabs {...props}/>
    </>
  )
}
