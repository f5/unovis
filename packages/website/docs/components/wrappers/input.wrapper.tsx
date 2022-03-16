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
}
/* Displays XYWrapper with input element that dynamically updates a given property */
export function XYWrapperWithInput ({ property, inputType: type, defaultValue, inputProps, ...rest }: InputWrapperProps): JSX.Element {
  const [attr, setAttr] = React.useState(defaultValue)

  return (
    <div className="input-wrapper">
      <label className={`prop-input-label${rest.excludeTabs ? ' center' : ''}`}>
          preview: <span className="prop-name">{property}</span>
        <input
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
        />
      </label>
      <XYWrapper {...{ [property]: attr, ...rest }} />
    </div>
  )
}
