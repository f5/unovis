/* eslint-disable @typescript-eslint/naming-convention,import/no-absolute-path,@typescript-eslint/ban-ts-comment */
import React from 'react'
// @ts-ignore
import { useTabGroupChoice } from '/node_modules/@docusaurus/theme-common/lib/contexts/tabGroupChoice'
import { Framework } from '@site/src/types/code'
import { Example } from '@site/src/types/example'
import { launchStackBlitz } from '@site/src/utils/stackblitz'
import Tabs from '@theme-original/Tabs'

import s from './styles.module.css'

type TabProps = {
  children: JSX.Element[];
  groupId?: string;
  example?: Example;
}

export default function TabsWrapper (props: TabProps): JSX.Element {
  const groups = useTabGroupChoice()
  const current = groups.tabGroupChoices.framework as Framework

  const StackBlitzButton = (): JSX.Element => (
    <div className={s.button} onClick={() => launchStackBlitz(current, props.example)}>
      <img
        src="https://developer.stackblitz.com/img/open_in_stackblitz.svg"
        alt="Open in StackBlitz"
      />
    </div>
  )
  return (
    <div className={s.container}>
      {props.groupId === 'framework' && Object.values(Framework).includes(current) && props.example && <StackBlitzButton/>}
      <Tabs {...props}/>
    </div>
  )
}
