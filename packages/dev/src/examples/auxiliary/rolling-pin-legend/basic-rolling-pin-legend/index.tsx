import React from 'react'
import { VisRollingPinLegend } from '@unovis/react'

import s from './styles.module.css'

export const title = 'Basic Rolling Pin Legend'
export const subTitle = ''

const spectrumColors = ['#11F', '#55F', '#99F', '#DDF', '#FFF', '#FDD', '#F99', '#F55', '#F11']

const linearColors = ['#000', '#040', '#080', '#0C0']

export const component = (): React.ReactNode => {
  return (
    <div className={s.legendExample}>
      <VisRollingPinLegend rects={spectrumColors} leftLabelText='Democrat' rightLabelText='Republican' />
      <VisRollingPinLegend rects={linearColors} leftLabelText='0' rightLabelText='100' />
    </div>
  )
}
