import React from 'react'
import { DocWrapper, DocWrapperProps } from '../base'

import './styles.css'

type InputWrapperProps = DocWrapperProps & {
  inputType: React.HTMLInputTypeAttribute;
  property: string; // prop for component that will be updated when input elment updates
  defaultValue?: any;
  inputProps?: React.InputHTMLAttributes<any>;
  options?: string[]; // options for select type (first one by default)
}

/* Displays component with an input element that dynamically updates a given property */
export function InputWrapper ({ property, inputType: type, defaultValue, inputProps, options, ...rest }: InputWrapperProps): JSX.Element {
  const [attr, setAttr] = React.useState(defaultValue || options?.[0])

  return (
    <div className='input-wrapper'>
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
      <DocWrapper {...{ [property]: attr, ...rest }}/>
    </div>
  )
}
