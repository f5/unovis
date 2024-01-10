import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import { PropItem } from 'react-docgen-typescript'
import { useDynamicImport } from 'docusaurus-plugin-react-docgen-typescript/pkg/dist-src/hooks/useDynamicImport'

import s from './index.module.css'

export type PropsTableProps = {
  name: string;
}

export const PropsTable = ({ name }: PropsTableProps): JSX.Element => {
  const props: Record<string, PropItem> = useDynamicImport(name)
  const propsArray = Object.entries(props || {})
    .sort((a, b) => Number(b[1].required) - Number(a[1].required))
    .filter(p => p[1].name !== 'ref')
  return (
    <table className={s.table}>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {propsArray.map(([key, prop]) => {
          return (
            <tr key={key}>
              <td>
                <code>{key}</code>
                {prop.required && '*'}
              </td>
              <td>
                <code>{prop.type?.name}</code>
              </td>
              <td>
                <ReactMarkdown children={prop.description}/>
              </td>
            </tr>
          )
        })}
      </tbody>
      <tfoot>
        <tr><td>* required property</td></tr>
      </tfoot>
    </table>
  )
}
