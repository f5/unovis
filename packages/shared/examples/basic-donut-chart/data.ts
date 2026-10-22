export type DataRecord = { key: string; value: number; icon: string }

// Icons are Font Awesome glyphs (see styles.css): user, snowflake, hashtag, paw, glasses, ellipsis
export const data: DataRecord[] = [
  { key: 'names', value: 1396, icon: '&#xf007;' },
  { key: 'cool', value: 928, icon: '&#xf2dc;' },
  { key: 'alphanumeric', value: 864, icon: '&#xf292;' },
  { key: 'fluffy', value: 518, icon: '&#xf1b0;' },
  { key: 'nerdy', value: 294, icon: '&#xf530;' },
  { key: 'other', value: 916, icon: '&#xf141;' },
]
