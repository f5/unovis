// Copyright (c) Volterra, Inc. All rights reserved.

export interface VisControlItemInterface {
  icon: string;
  callback?: () => any;
  hidden?: boolean;
}

export enum VisControlsOrientation {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
}
