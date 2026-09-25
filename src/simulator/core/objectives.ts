import type { AttackState, EnumerationState, Objective, SimulatorState, TerminalLine } from '@/types/simulator'

export const credentialVaultObjectives: Objective[] = [
  { id: 'enumerate-workstation', label: 'Enumerate the compromised workstation', complete: false },
  { id: 'identify-privileged-accounts', label: 'Identify privileged accounts', complete: false },
  { id: 'locate-authentication-artifacts', label: 'Locate authentication artifacts', complete: false },
  { id: 'analyze-credential-material', label: 'Analyze the recovered credential material', complete: false },
  { id: 'identify-credential-account', label: 'Identify the account associated with the credential', complete: false },
  { id: 'obtain-elevated-authentication', label: 'Obtain elevated authentication', complete: false },
  { id: 'access-restricted-server', label: 'Access the restricted file server', complete: false },
  { id: 'retrieve-flag', label: 'Retrieve the flag', complete: false },
]

export function createTerminalLine(text: string, kind: TerminalLine['kind'] = 'output'): TerminalLine {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    kind,
    text,
  }
}

export function evaluateObjectives(
  enumeration: EnumerationState,
  attackState: AttackState,
  flagRetrieved: boolean,
): Objective[] {
  const workstationEnumerated =
    enumeration.directoryListing &&
    enumeration.users &&
    enumeration.services &&
    enumeration.processes &&
    enumeration.network

  return credentialVaultObjectives.map((objective) => ({
    ...objective,
    complete: {
      'enumerate-workstation': workstationEnumerated,
      'identify-privileged-accounts': attackState.privilegedAccountIdentified,
      'locate-authentication-artifacts': attackState.credentialArtifactFound,
      'analyze-credential-material': attackState.credentialAnalyzed,
      'identify-credential-account': attackState.credentialAccountIdentified,
      'obtain-elevated-authentication': attackState.privilegedAuthenticationObtained,
      'access-restricted-server': attackState.restrictedServerAccessed,
      'retrieve-flag': flagRetrieved,
    }[objective.id] ?? false,
  }))
}

export function isChallengeComplete(state: SimulatorState): boolean {
  return state.attackState.flagRetrieved && state.objectives.every((objective) => objective.complete)
}
