export interface BulletLegendItemInterface {
  name: string | number;
  color?: string;
  inactive?: boolean;
  hidden?: boolean;
  pointer?: boolean;
}

export enum BulletShape {
  Circle = 'circle',
  Line = 'line',
  Square = 'square',
}
