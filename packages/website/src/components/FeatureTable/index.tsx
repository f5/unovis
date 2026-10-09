import React, { Fragment, useState } from 'react'
import clsx from 'clsx'

// Internal Deps
import { featureGroups, support, FeatureGroup } from '@site/src/comparisons/features'
import { libraries } from '@site/src/comparisons/libraries'
import { FEATURE_TABLE_LIBRARIES } from './constants'
import { FeatureCell } from './cell'

// Styles
import s from './styles.module.css'

export { FeatureStatusLegend } from './legend'

export type FeatureTableProps = {
  /** Ids of the features to show. Shows every feature group when omitted */
  features?: string[];
}

export function FeatureTable ({ features }: FeatureTableProps): JSX.Element {
  const [showNotes, setShowNotes] = useState(false)
  const allFeatures = featureGroups.flatMap(g => g.features)
  const groups: FeatureGroup[] = features
    ? [{ id: 'selected', title: '', features: features.map(id => allFeatures.find(f => f.id === id)).filter(Boolean) }]
    : featureGroups

  return (
    <div className={s.root}>
      <div className={s.toolbar}>
        <label className={s.toggle}>
          <input type="checkbox" checked={showNotes} onChange={() => setShowNotes(!showNotes)}/>
          Show details
        </label>
      </div>
      <div className={s.scroll}>
        <table className={clsx(s.table, showNotes && s.detailed)}>
          <thead>
            <tr>
              <th className={s.featureColumn}>Feature</th>
              {FEATURE_TABLE_LIBRARIES.map(id => (
                <th key={id} className={clsx(id === 'unovis' && s.unovis)}>
                  {libraries[id].name}
                  <span className={s.version}>{libraries[id].version}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map(group => (
              <Fragment key={group.id}>
                {group.title && (
                  <tr className={s.groupRow}>
                    <th colSpan={FEATURE_TABLE_LIBRARIES.length + 1} id={group.id}>{group.title}</th>
                  </tr>
                )}
                {group.features.map(feature => (
                  <tr key={feature.id}>
                    <th scope="row" className={s.featureColumn}>{feature.label}</th>
                    {FEATURE_TABLE_LIBRARIES.map(id => (
                      <FeatureCell key={id} cell={support[id][feature.id]} textOnly={feature.textOnly} showNote={showNotes}/>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
