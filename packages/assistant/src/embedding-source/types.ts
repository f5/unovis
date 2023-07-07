export type Meta = Record<string, string | number | bigint | true | RegExp | undefined> | undefined

export type Section = {
  content: string;
  heading?: string;
  slug?: string;
}

export type ProcessedMdx = {
  checksum: string;
  meta: Meta;
  sections: Section[];
}

