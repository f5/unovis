import React from 'react'
import { VisBulletLegend } from '@unovis/react'
import { BulletLegendItemInterface } from '@unovis/ts'

import s from './styles.module.css'

export const title = 'Bullet Legend with Multiple Colors'
export const subTitle = 'with multiple colors per entry'

const colorPalette = ['#4cc9f0', '#4361ee', '#f72585', '#7209b7', '#3a0ca3', '#f9c74f', '#f94144']
const getRandomColor = (): string => colorPalette[Math.floor(Math.random() * colorPalette.length)]

export const component = (): React.ReactNode => {
  const items: BulletLegendItemInterface[] = Array(6).fill(0).map((_, i) => {
    const numColors = Math.floor(Math.random() * 2) + 2 // 2 or 3
    return {
      name: `y${i}`,
      color: Array(numColors).fill(0).map(getRandomColor),
    }
  })

  return (
    <div className={s.legendExample}>
      <VisBulletLegend items={items}/>
    </div>
  )
}
