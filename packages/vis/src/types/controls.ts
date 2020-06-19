// Copyright (c) Volterra, Inc. All rights reserved.

export interface VisControlItemInterface {
  icon: string;
  callback?: () => any;
  disabled?: boolean;
  borderLeft?: boolean;
  borderTop?: boolean;
  borderRight?: boolean;
  borderBottom?: boolean;
}

export enum VisControlsOrientation {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
}
