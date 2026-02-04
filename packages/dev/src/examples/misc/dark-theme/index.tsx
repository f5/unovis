import React from "react";
import { VisXYContainer, VisLine, VisAxis } from "@unovis/react";
import { ExampleViewerDurationProps } from "@src/components/ExampleViewer/index";

type Datum = { x: number; y: number };

export const title = "Dark Theme";
export const subTitle = "Dark theme selectors for chart styling";

const data: Datum[] = [
  { x: 0, y: 1 },
  { x: 1, y: 3 },
  { x: 2, y: 2 },
  { x: 3, y: 4 },
];

export const component = (
  props: ExampleViewerDurationProps,
): React.ReactNode => {
  return (
    <VisXYContainer<Datum> data={data} height={400}>
      <VisLine x={(d) => d.x} y={(d) => d.y} duration={props.duration} />
      <VisAxis type="x" duration={props.duration} />
      <VisAxis type="y" duration={props.duration} />
    </VisXYContainer>
  );
};
