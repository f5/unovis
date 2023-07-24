import React, { useEffect } from 'react'

// Internal Deps
import { FrameworkTabs } from '@site/src/components/FrameworkTabs'
import { Example } from '@site/src/types/example'

// Styles
import s from './styles.module.css'


export type GalleryViewerProps = {
  example: Example;
  useTypescriptCode?: boolean;
}

export function GalleryViewer ({ example, useTypescriptCode }: GalleryViewerProps): JSX.Element {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    if (useTypescriptCode) require(`../../examples/${example.pathname}/${example.pathname}.ts`)
  })

  return (<div className={s.root}>
    <div className={s.title}>
      <h1>{example.title}</h1>
    </div>
    <div className={s.example} id="vis-container">
      {!useTypescriptCode && example.component()}
    </div>
    <div className={s.description}>{example.description}</div>
    <div className={s.codeBlock}>
      <FrameworkTabs
        angular={{
          module: example.codeAngular.module,
          component: example.codeAngular.component,
          template: example.codeAngular.html,
        }}
        react={example.codeReact}
        svelte={example.codeSvelte}
        typescript={example.codeTs}
        data={example.data}
        showStackblitzButton={true}
      />
    </div>
  </div>)
}
