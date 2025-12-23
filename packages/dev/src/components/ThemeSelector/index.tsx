import React, { useEffect, useRef } from 'react'

// Styles
import s from './style.module.css'

export function ThemeSelector (): React.ReactNode {
  const darkCheckboxRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      document.body.classList.add('theme-dark')
      if (darkCheckboxRef.current) darkCheckboxRef.current.checked = true
    }
  }, [])

  const toggleTheme = (e: React.FormEvent): void => {
    document.body.classList.toggle((e.target as Element).id)
  }

  return (
    <div onChange={toggleTheme} className={s.themeSelector}>
      <label className={s.colorTheme}>
        <input type='checkbox' id='theme-dark' ref={darkCheckboxRef}/>
        <div className='slider'>
          <span className='fa-solid fa-sun'/>
          <span className='fa-solid fa-moon'/>
        </div>
      </label>
      <label className={s.patternTheme}>
        <input type='checkbox' id='theme-patterns'/>
        <span className='fa-solid fa-magic-wand-sparkles'/>
      </label>
    </div>
  )
}
