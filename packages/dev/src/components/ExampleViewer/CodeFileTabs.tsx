import React from 'react'
import { useSandpack } from '@codesandbox/sandpack-react'

// Styles
import s from './style.module.css'

export function CodeFileTabs (): React.ReactElement | null {
  const { sandpack } = useSandpack()
  const { visibleFiles, activeFile, setActiveFile } = sandpack

  if (visibleFiles.length < 2) return null

  return (
    <div className={s.fileTabs}>
      {visibleFiles.map(file => (
        <button
          key={file}
          className={`${s.fileTab} ${file === activeFile ? s.fileTabActive : ''}`}
          onClick={() => setActiveFile(file)}
        >
          {file.replace(/^\//, '')}
        </button>
      ))}
    </div>
  )
}
