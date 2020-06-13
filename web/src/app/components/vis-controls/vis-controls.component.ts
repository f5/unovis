// Copyright (c) Volterra, Inc. All rights reserved.
import { Component, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core'

// Vis
import { VisControls, VisControlsConfigInterface, VisControlItemInterface, VisControlsOrientation } from '@volterra/vis'

@Component({
  selector: 'vis-controls',
  templateUrl: './vis-controls.component.html',
  styleUrls: ['./vis-controls.component.css'],
})
export class VisControlsComponent implements AfterViewInit {
  @ViewChild('controls', { static: false }) controlsRef: ElementRef
  @Input() items: VisControlItemInterface[] = [];
  @Input() orientation: VisControlsOrientation = VisControlsOrientation.VERTICAL

  config: VisControlsConfigInterface = {}
  controls = null

  ngAfterViewInit (): void {
    this.config = {
      items: this.items,
      orientation: this.orientation,
    }

    this.controls = new VisControls(this.controlsRef.nativeElement, this.config)
  }
}
