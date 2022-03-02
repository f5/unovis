// Copyright (c) Volterra, Inc. All rights reserved.
export type SankeyNode = {
  id: string;
  label: string;
  color: string;
  sublabel: string;
  type: string;
  orientation?: string;
};

export type SankeyLink = {
  flow: number;
  source: string;
  target: string;
};

export type SankeyData = {
  nodes: SankeyNode[];
  links: SankeyLink[];
};

export const loginFlowData: SankeyData = {
  nodes: [
    {
      label: '17,013',
      type: 'src',
      id: 'Customers',
      color: '#0F1E57',
      sublabel: 'Customers attempting login',
    },
    {
      label: '88% (14,193)',
      type: 'src',
      color: '#9EA7B8',
      id: 'LoginSuccessful',
      sublabel: 'Login successful on first attempt',
      orientation: 'right',
    },
    {
      label: '12% (2,100)',
      type: 'src',
      color: '#FF8B01',
      id: 'LoginFailed',
      sublabel: 'Login failed on first attempt',
      orientation: 'right',
    },
    {
      label: '11% (1,963)',
      type: 'dst',
      color: '#FDBB35',
      id: 'MultipleAttepmts',
      sublabel: 'Login eventually successful after multiple attempts',
    },
    {
      label: '1% (137)',
      type: 'dst',
      color: '#DD340A',
      id: 'NotSuccessful',
      sublabel: 'Login(s) not successful',
    },
  ],
  links: [
    {
      flow: 100,
      source: 'Customers',
      target: 'LoginSuccessful',
    },
    {
      flow: 12,
      source: 'Customers',
      target: 'LoginFailed',
    },
    {
      flow: 11,
      source: 'LoginFailed',
      target: 'MultipleAttepmts',
    },
    {
      flow: 1,
      source: 'LoginFailed',
      target: 'NotSuccessful',
    },
  ],
}
