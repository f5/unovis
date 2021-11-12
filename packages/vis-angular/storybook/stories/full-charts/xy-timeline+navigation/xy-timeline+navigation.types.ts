// Copyright (c) Volterra, Inc. All rights reserved.
export interface TimelineDataRecord {
  timestamp: number;
  duration: number;
  kind: string;
  name: string;
  id: string;
}

export interface NavigationDataRecord {
  timestamp: number;
  value: number;
  id: string;
  events: TimelineDataRecord[];
}
