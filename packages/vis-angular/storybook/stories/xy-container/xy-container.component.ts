// Copyright (c) Volterra, Inc. All rights reserved.
import { AfterViewInit, Component, ContentChild, Input } from '@angular/core'
import { XYContainerConfigInterface, Scale } from '@volterra/vis'
import { VisXYContainerComponent } from 'src/containers'
import { DataRecord } from 'storybook/data/time-series'

@Component({
  selector: 'xy-container-story',
  template: `
    <div *ngIf="sideElement" class="sample"></div>
    <div id="container" [ngStyle]="{'width.px': storyWidth, 'height.px': storyHeight }">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      align-items: center;
    }

    #container {
      flex-grow: 1;
    }

    .sample {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 20px;
      width: 100px;
      height: 100px;
      padding: 20px;
      background-color: lightslategrey;
    }
  `],
})
export class XYContainerStory implements AfterViewInit {
  @Input() config: XYContainerConfigInterface<DataRecord>;
  @Input() sideElement: boolean;
  @Input() storyHeight: number;
  @Input() storyWidth: number;
  @ContentChild(VisXYContainerComponent) containerStory: VisXYContainerComponent;

  ngAfterViewInit (): void {
    this.containerStory.chart.update({ ...this.containerStory.getConfig(), ...this.config })
  }
}
