// Copyright (c) Volterra, Inc. All rights reserved.
import { Story } from '@storybook/angular'

export type SingleVisStoryConfig = {
  data: any;
  storyWidth?: number;
  storyHeight?: number;
  storyStyles?: string;
}

export function singleVisContentWrapper<T> (story: Story<SingleVisStoryConfig & T>): string {
  return `
    <div style="width: 100%; position: relative" [ngStyle]="{'width.px': storyWidth, 'height.px': storyHeight ?? 300 }">
      <vis-single-container [data]="data" [style]="storyStyles">
        ${story}
      </vis-single-container>
    </div>
  `
}
