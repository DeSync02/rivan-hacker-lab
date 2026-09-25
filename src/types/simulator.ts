export type CredentialType = 'password' | 'hash' | 'token'

export interface SimUser {
  id: string
  username: string
  role: string
  privileges: string[]
}

export interface SimCredential {
  id: string
  username: string
  type: CredentialType
  value: string
  source: string
  compromised: boolean
}

export interface SimFile {
  path: string
  name: string
  content?: string
  permissions: string[]
  owner: string
  hidden?: boolean
}

export interface SimProcess {
  pid: number
  name: string
  user: string
  commandLine: string
}

export interface SimService {
  name: string
  displayName: string
  account: string
  status: 'Running' | 'Stopped'
  configPath: string
}

export interface SimScheduledTask {
  name: string
  account: string
  schedule: string
  action: string
}

export interface SimNetworkConnection {
  localAddress: string
  remoteAddress: string
  port: number
  state: string
  description: string
}

export interface SimSecurityControl {
  name: string
  status: string
  detail: string
}

export interface SimHost {
  id: string
  hostname: string
  ip: string
  os: string
  users: string[]
  files: Record<string, SimFile>
  processes: SimProcess[]
  services: SimService[]
  scheduledTasks: SimScheduledTask[]
  networkConnections: SimNetworkConnection[]
  securityControls: SimSecurityControl[]
}

export interface SimSession {
  currentUser: string
  currentHostId: string
  currentPath: string
  privilegeLevel: string
  authenticationMethod: 'password' | 'hash' | 'token' | 'none'
  connectedHostIds: string[]
}

export interface EnumerationState {
  whoami: boolean
  hostname: boolean
  directoryListing: boolean
  users: boolean
  services: boolean
  processes: boolean
  network: boolean
}

export interface AttackState {
  workstationEnumerated: boolean
  credentialArtifactFound: boolean
  credentialAnalyzed: boolean
  privilegedAccountIdentified: boolean
  credentialAccountIdentified: boolean
  privilegedAuthenticationObtained: boolean
  restrictedServerAccessed: boolean
  flagRetrieved: boolean
}

export interface Objective {
  id: string
  label: string
  complete: boolean
}

export interface TerminalLine {
  id: string
  kind: 'input' | 'output' | 'error' | 'success' | 'system'
  text: string
  prompt?: string
}

export interface SimulatorState {
  challengeId: string
  users: SimUser[]
  credentials: SimCredential[]
  hosts: SimHost[]
  session: SimSession
  enumeration: EnumerationState
  attackState: AttackState
  objectives: Objective[]
  terminalHistory: TerminalLine[]
  discoveredPaths: string[]
  knownAccounts: string[]
  hintsUsed: number
  flagRetrieved: boolean
}

export interface CommandResult {
  state: SimulatorState
  output: string
  kind: 'output' | 'error' | 'success' | 'system'
}
