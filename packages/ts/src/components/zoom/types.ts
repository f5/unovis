/** Callbacks the XY Container provides to Zoom */
export type ZoomContainerHooks = {
  /** Re-renders the container. Zoom gestures render without animations */
  render: (animate: boolean) => void;
  /** Called when a two-finger pinch starts, so the container can hide the Crosshair and the Tooltip */
  onPinchStart: (event: PointerEvent) => void;
}
