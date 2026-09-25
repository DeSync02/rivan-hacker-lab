import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  isValidDnsFlag,
  parseDnsCommand,
  resetDnsReconState,
  submitDnsFlag,
} from '../src/simulator/challenges/dns-reconnaissance'

const flag = 'CYBERLAB{dns_recon_complete}'

function run(state: ReturnType<typeof resetDnsReconState>, command: string) {
  return parseDnsCommand(state, command)
}

function completeEvidence(state = resetDnsReconState()) {
  let next = run(state, 'dig internal.lab')
  next = run(next, 'dig @10.20.0.53 internal.lab AXFR')
  next = run(next, 'dig @10.20.0.53 flag.internal.lab TXT')
  return next
}

test('accepts the canonical flag', () => {
  assert.equal(isValidDnsFlag(flag), true)
  assert.equal(submitDnsFlag(completeEvidence(), flag).flagSubmitted, true)
})

test('accepts surrounding whitespace without changing flag contents', () => {
  assert.equal(isValidDnsFlag(`  ${flag}  `), true)
  assert.equal(submitDnsFlag(completeEvidence(), `  ${flag}  `).flagSubmitted, true)
})

test('rejects an incorrect flag', () => {
  assert.equal(isValidDnsFlag('CYBERLAB{wrong_flag}'), false)
  assert.equal(submitDnsFlag(completeEvidence(), 'CYBERLAB{wrong_flag}').flagSubmitted, false)
})

test('rejects the AXFR descriptive TXT value', () => {
  assert.equal(isValidDnsFlag('restricted-lab-objective'), false)
})

test('tracks evidence from the required workflow and completes only after submission', () => {
  let state = run(resetDnsReconState(), 'dig internal.lab')
  assert.deepEqual(state.objectives.map((objective) => objective.complete), [true, true, false, false, false, false])

  state = run(state, 'dig @10.20.0.53 internal.lab AXFR')
  assert.deepEqual(state.objectives.map((objective) => objective.complete), [true, true, true, true, false, false])

  state = run(state, 'dig @10.20.0.53 flag.internal.lab TXT')
  assert.deepEqual(state.objectives.map((objective) => objective.complete), [true, true, true, true, true, false])
  assert.equal(state.discovered.flagRetrieved, true)

  state = submitDnsFlag(state, flag)
  assert.deepEqual(state.objectives.map((objective) => objective.complete), [true, true, true, true, true, true])
  assert.equal(state.flagSubmitted, true)
})

test('optional commands do not change required evidence', () => {
  const state = run(resetDnsReconState(), 'host ops-console.internal.lab')
  assert.deepEqual(state.objectives.map((objective) => objective.complete), [false, false, false, false, false, false])
})

test('AXFR exposes the flag host but never the completion flag', () => {
  const state = run(resetDnsReconState(), 'dig @10.20.0.53 internal.lab AXFR')
  const axfrOutput = state.terminalHistory.map((line) => line.text).join('\n')
  assert.match(axfrOutput, /flag\.internal\.lab\.\s+900 IN A/)
  assert.doesNotMatch(axfrOutput, /CYBERLAB\{dns_recon_complete\}/)
  assert.equal(state.discovered.flagHostDiscovered, true)
  assert.equal(state.discovered.flagRetrieved, false)
})

test('only the targeted TXT query reveals the completion flag', () => {
  let state = run(resetDnsReconState(), 'dig @10.20.0.53 internal.lab AXFR')
  state = run(state, 'dig @10.20.0.53 flag.internal.lab A')
  assert.doesNotMatch(state.terminalHistory.at(-1)?.text ?? '', /CYBERLAB\{dns_recon_complete\}/)
  state = run(state, 'dig @10.20.0.53 flag.internal.lab MX')
  assert.doesNotMatch(state.terminalHistory.at(-1)?.text ?? '', /CYBERLAB\{dns_recon_complete\}/)
  state = run(state, 'dig @10.20.0.53 flag.internal.lab TXT')
  assert.equal(state.discovered.flagRetrieved, true)
  assert.match(state.terminalHistory.at(-2)?.text ?? '', /CYBERLAB\{dns_recon_complete\}/)
})

test('evidence-shaped state survives serialization and rehydrates completion', () => {
  const persisted = JSON.stringify(submitDnsFlag(completeEvidence(), flag))
  const restored = JSON.parse(persisted) as ReturnType<typeof resetDnsReconState>
  assert.deepEqual(restored.objectives.map((objective) => objective.complete), [true, true, true, true, true, true])
  assert.equal(restored.flagSubmitted, true)
  assert.equal(restored.discovered.flagRetrieved, true)
})