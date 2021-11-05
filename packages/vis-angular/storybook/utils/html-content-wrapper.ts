// Copyright (c) Volterra, Inc. All rights reserved.
import { Story } from '@storybook/angular'

export type HtmlVisStoryConfig = {
  data: any;
  storyWidth?: number;
  storyHeight?: number;
}

export function htmlVisContentWrapper<T> (story: Story<HtmlVisStoryConfig & T>): string {
  return `
    <div style="position: relative" [ngStyle]="{'width.px': storyWidth, 'height.px': storyHeight }">
        ${story}
    </div>
  `
}
