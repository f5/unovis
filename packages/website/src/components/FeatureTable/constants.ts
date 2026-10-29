import type { SupportStatus } from '@site/src/comparisons/features'
import type { LibraryId } from '@site/src/comparisons/types'

export const FEATURE_TABLE_LIBRARIES: LibraryId[] = ['unovis', 'recharts', 'chartjs', 'echarts', 'nivo', 'agcharts', 'plot', 'vegalite', 'tanstack']

export const SUPPORT_STATUS_LABELS: Record<SupportStatus, { icon: string; label: string; description: string }> = {
  yes: { icon: '✓', label: 'Built in', description: 'Part of the library' },
  partial: { icon: '◐', label: 'Partial', description: 'Built in, with the limits described in the note' },
  'plugin-official': { icon: '+', label: 'Official plugin', description: 'An add-on package from the library’s maintainers' },
  'plugin-community': { icon: '+', label: 'Community plugin', description: 'A third-party add-on package' },
  enterprise: { icon: '$', label: 'Paid edition', description: 'Only in AG Charts Enterprise' },
  custom: { icon: '✎', label: 'Custom code', description: 'Possible with your own code on top of the library' },
  no: { icon: '✕', label: 'No', description: 'Not supported' },
}

/** Distance between a status icon and its tooltip, in pixels */
export const FEATURE_TOOLTIP_OFFSET = 8
