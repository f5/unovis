export type SupportStatus = 'yes' | 'partial' | 'plugin-official' | 'plugin-community' | 'enterprise' | 'custom' | 'no'

export type SupportCell = {
  status: SupportStatus;
  /** Short value for text-only features, e.g. `'SVG'` */
  value?: string;
  note: string;
  url?: string;
}

export type Feature = {
  id: string;
  label: string;
  /** Show the note as the value instead of a support status */
  textOnly?: boolean;
}

export type FeatureGroup = {
  id: string;
  title: string;
  features: Feature[];
}

export type LibrarySupport = Record<string, SupportCell>
