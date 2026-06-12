/* eslint-disable @typescript-eslint/naming-convention */
import { SymbolType } from 'types/symbol'
import { FillPatternType, LinePatternType } from 'styles/patterns'

export interface BulletLegendItemInterface {
  name: string | number;
  color?: string | Array<string>;
  className?: string;
  shape?: BulletShape;
  inactive?: boolean;
  hidden?: boolean;
  pointer?: boolean;
  colorKey?: string;
  /** Pattern to render on the bullet. Matches a component's `pattern` accessor. Default: `undefined` */
  pattern?: FillPatternType | LinePatternType;
}

export const BulletShape = {
  ...SymbolType,
  Line: 'line',
} as const

export type BulletShape = typeof BulletShape[keyof typeof BulletShape]

export enum BulletLegendOrientation {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}
