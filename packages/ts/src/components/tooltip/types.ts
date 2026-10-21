export interface TooltipContent<Datum = unknown> {
  datum: Datum | undefined;
  /** Index of the hovered element for selector triggers. */
  index?: number;
  elements?: (HTMLElement | SVGElement)[];
  trigger?: string | symbol;

}

export type TooltipContentRenderer = (content: TooltipContent | null) => void

export type TooltipContentTemplate = (context: TooltipContent<any>) => string | HTMLElement | null | undefined | void

export type TooltipContentMap<Content = TooltipContentTemplate> = Record<string | symbol, Content | undefined>
