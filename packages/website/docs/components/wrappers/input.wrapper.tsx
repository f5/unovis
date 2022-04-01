// Copyright (c) Volterra, Inc. All rights reserved.
import * as React from 'react'
import { XYComponentConfigInterface } from '@volterra/vis'

import { DataRecord } from '../../utils/data'
import { XYWrapper, XYWrapperProps } from './xy-wrapper'

type InputWrapperProps = XYWrapperProps & {
  inputType: React.HTMLInputTypeAttribute;
  property: keyof XYComponentConfigInterface<DataRecord>; // prop for XYComponent that will be updated when input elment updates
  defaultValue?: any;
  inputProps?: React.InputHTMLAttributes<any>;
  options?: string[]; // options that attr can be set to (first one by default)
}

/* Displays XYWrapper with input element that dynamically updates a given property */
export function XYWrapperWithInput ({ property, inputType: type, defaultValue, inputProps, options, ...rest }: InputWrapperProps): JSX.Element {
  const [attr, setAttr] = React.useState(defaultValue)

  return (
    <div className="input-wrapper">
      <XYWrapper {...{ [property]: attr, ...rest }}>
        <label className='prop-input-label'>
          <code>{property}: </code>
          {type === 'select'
            ? <select defaultValue={defaultValue} onChange={e => setAttr(e.target.value)}>
              {options.map(o => (
                <option value={o} key={o}>{o}</option>
              ))}
            </select>
            : <input
              type={type}
              defaultValue={defaultValue}
              onChange={(e) => {
                if (type === 'number' || type === 'range') {
                  setAttr(Number(e.target.value))
                } else if (type === 'checkbox') {
                  setAttr(!attr)
                } else {
                  setAttr(e.target.value)
                }
              }}
              {...inputProps}
              checked={attr}
            />}
        </label>
      </XYWrapper>
    </div>
  )
}
