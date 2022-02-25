// Copyright (c) Volterra, Inc. All rights reserved.
import * as React from 'react'
import { PropItem } from 'react-docgen-typescript'
import { useDynamicImport } from 'docusaurus-plugin-react-docgen-typescript/pkg/dist-src/hooks/useDynamicImport'

export const PropTable = ({ name }): JSX.Element => {
  const props: Record<string, PropItem> = useDynamicImport(name)
  const propsArray = Object.entries(props || {})
    .sort((a, b) => Number(b[1].required) - Number(a[1].required))

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Default Value</th>
          <th>Required</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {propsArray.map(([key, prop]) => {
          return (
            <tr key={key}>
              <td>
                <code>{key}</code>
              </td>
              <td>
                <code>{prop.type?.name}</code>
              </td>
              <td>
                {prop.defaultValue && (
                  <code>{prop.defaultValue.value}</code>
                )}
              </td>
              <td>{prop.required ? 'Yes' : 'No'}</td>
              <td>{prop.description}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
