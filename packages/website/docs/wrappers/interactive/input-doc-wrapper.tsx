import React, { BaseSyntheticEvent } from 'react'
import { DocWrapper, DocWrapperProps } from '../base'

type InputWrapperProps = DocWrapperProps & {
  inputType: React.HTMLInputTypeAttribute;
  property: string; // prop for component that will be updated when input elment updates
  defaultValue?: any;
  inputProps?: React.InputHTMLAttributes<any>;
  options?: string[]; // options for select type (first one by default)
  onChange: (v: string) => any;
}

/* Displays component with an input element that dynamically updates a given property */
export function InputWrapper ({ property, inputType: type, defaultValue, inputProps, options, onChange, ...rest }: InputWrapperProps): JSX.Element {
  const [attr, setAttr] = React.useState(defaultValue || options?.[0])
  function updateAttr (e: BaseSyntheticEvent): void {
    return onChange ? setAttr(onChange(e.target.value)) : setAttr(e.target.value)
  }

  return (
    <div className='input-wrapper'>
      <label className={`prop-input-label ${rest.excludeTabs ? '' : 'compact'}`}>
        <code>{property}: </code>
        {type === 'select'
          ? <select defaultValue={options[0]} onChange={updateAttr}>
            {options?.map(o => (
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
