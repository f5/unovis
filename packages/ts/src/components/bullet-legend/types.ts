/* eslint-disable @typescript-eslint/naming-convention */
import { SymbolType } from 'types/symbol'

export interface BulletLegendItemInterface {
  name: string | number;
  color?: string;
  className?: string;
  shape?: BulletShape;
  inactive?: boolean;
  hidden?: boolean;
  pointer?: boolean;
}

export const BulletShape = {
  ...SymbolType,
  Line: 'line',
} as const

export type BulletShape = typeof BulletShape[keyof typeof BulletShape]
