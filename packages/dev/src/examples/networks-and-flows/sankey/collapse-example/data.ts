export type Node = {
  id: string;
  label: string;
  value: number;
  color?: string;
  disabled?: boolean; // New field to test the disabledField functionality
}

export type Link = {
  source: string;
  target: string;
  value: number;
}

export const collapseExampleData = {
  nodes: [
    // Layer 0 (sources)
    { id: 'A', label: 'Source A', value: 100, color: '#ff6b6b' },
    { id: 'B', label: 'Source B', value: 80, color: '#4ecdc4' },

    // Layer 1 (intermediate level 1) - Process D is disabled/pre-collapsed
    { id: 'C', label: 'Process C', value: 90, color: '#96ceb4' },
    { id: 'D', label: 'Process D (Disabled)', value: 70, color: '#feca57', disabled: true },
    { id: 'E', label: 'Process E', value: 60, color: '#ff9ff3' },

    // Layer 2 (intermediate level 2) - Transform F is disabled/pre-collapsed
    { id: 'F', label: 'Transform F (Disabled)', value: 80, color: '#54a0ff', disabled: true },
    { id: 'G', label: 'Transform G', value: 60, color: '#5f27cd' },

    // Layer 3 (destinations)
    { id: 'H', label: 'End H', value: 60, color: '#ff3838' },
    { id: 'I', label: 'End I', value: 70, color: '#2ed573' },
  ],
  links: [
    // Layer 0 to 1
    { source: 'A', target: 'C', value: 60 },
    { source: 'A', target: 'D', value: 40 },
    { source: 'B', target: 'D', value: 30 },
    { source: 'B', target: 'E', value: 50 },

    // Layer 1 to 2
    { source: 'C', target: 'F', value: 50 },
    { source: 'C', target: 'G', value: 40 },
    { source: 'D', target: 'F', value: 30 },
    { source: 'E', target: 'G', value: 20 },

    // Layer 2 to 3
    { source: 'F', target: 'H', value: 40 },
    { source: 'F', target: 'I', value: 40 },
    { source: 'G', target: 'H', value: 25 },
    { source: 'G', target: 'I', value: 35 },
  ],
}
