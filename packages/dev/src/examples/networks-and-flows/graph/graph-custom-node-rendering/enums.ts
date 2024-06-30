export enum CustomGraphNodeType {
  Identity = 'identity',
  Network = 'network',
  Resource = 'resource',
  Compute = 'compute',
  Secret = 'secret',
  Finding = 'finding',
  ThreatActor = 'threat-actor',
}

export enum CustomGraphNodeStatus {
  Admin = 'admin',
  Crown = 'crown',
  Public = 'public',
  HighDataAccess = 'high-data-access',
}
