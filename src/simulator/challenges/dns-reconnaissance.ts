import type { Objective, TerminalLine } from '../../types/simulator'

export interface DnsReconState {
  objectives: Objective[]
  terminalHistory: TerminalLine[]
  hintIndex: number
  flagSubmitted: boolean
  discovered: {
    forwardLookup: boolean
    dnsServerIdentity: boolean
    zoneTransfer: boolean
    flagHostDiscovered: boolean
    flagRetrieved: boolean
  }
}

const flag = 'CYBERLAB{dns_recon_complete}'
const resolver = '10.20.0.53'
const flagHostAddress = '10.20.30.88'
const initialObjectives: Objective[] = [
  { id: 'forward', label: 'Identify internal DNS information', complete: false },
  { id: 'identity', label: 'Confirm the DNS server identity', complete: false },
  { id: 'zone-transfer', label: 'Detect unauthorized zone-transfer exposure', complete: false },
  { id: 'flag-host', label: 'Discover flag.internal.lab through AXFR', complete: false },
  { id: 'flag-retrieved', label: 'Retrieve the completion flag through a targeted TXT query', complete: false },
  { id: 'flag-submitted', label: 'Submit the completion flag', complete: false },
]

export const dnsHints = [
  'Start by querying the internal domain with a DNS enumeration tool.',
  'Use dig to query internal.lab and inspect the answer and authority sections.',
  'The DNS server may expose more information than a normal A record query.',
  'Research the DNS operation used to transfer an entire zone.',
  'Try an AXFR query against the internal.lab zone.',
  'The zone transfer reveals flag.internal.lab. Query its TXT record through the same resolver.',
]

function createLine(text: string, kind: TerminalLine['kind'], prompt?: string): TerminalLine {
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, kind, text, prompt }
}

function objectivesFor(state: Pick<DnsReconState, 'discovered' | 'flagSubmitted'>): Objective[] {
  return initialObjectives.map((objective) => ({
    ...objective,
    complete: {
      forward: state.discovered.forwardLookup,
      identity: state.discovered.dnsServerIdentity,
      'zone-transfer': state.discovered.zoneTransfer,
      'flag-host': state.discovered.flagHostDiscovered,
      'flag-retrieved': state.discovered.flagRetrieved,
      'flag-submitted': state.flagSubmitted,
    }[objective.id] ?? false,
  }))
}

export function resetDnsReconState(): DnsReconState {
  const discovered = {
    forwardLookup: false,
    dnsServerIdentity: false,
    zoneTransfer: false,
    flagHostDiscovered: false,
    flagRetrieved: false,
  }
  return {
    discovered,
    objectives: objectivesFor({ discovered, flagSubmitted: false }),
    flagSubmitted: false,
    hintIndex: 0,
    terminalHistory: [
      createLine('CYBERLAB // authorized DNS reconnaissance lab', 'system'),
      createLine('Kali simulator ready. Target scope: internal.lab', 'system'),
      createLine('No real network requests are made by this browser simulation.', 'system'),
    ],
  }
}

function normalize(value: string) {
  return value.toLowerCase().replace(/\.$/, '')
}

function addExplanation(lines: TerminalLine[], text: string) {
  lines.push(createLine(`WHY IT MATTERS\n${text}`, 'system'))
}

function digHeader(command: string) {
  return `; <<>> DiG 9.19.21-1+b1-Debian <<>> ${command}\n;; global options: +cmd\n;; Got answer:\n;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: ${Math.floor(Math.random() * 65536)}\n;; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 1, ADDITIONAL: 1\n\n;; OPT PSEUDOSECTION:\n; EDNS: version: 0, flags:; udp: 1232`
}

function digFooter(server: string, transport: 'UDP' | 'TCP', messageSize: number) {
  return `;; Query time: 0 msec\n;; SERVER: ${server}#53(${server}) (${transport})\n;; WHEN: ${new Date().toString()}\n;; MSG SIZE  rcvd: ${messageSize}`
}

function axfrFooter(server: string, recordCount: number, byteCount: number) {
  return `;; Query time: 0 msec\n;; SERVER: ${server}#53(${server}) (TCP)\n;; WHEN: ${new Date().toString()}\n;; XFR size: ${recordCount} records (messages 1, bytes ${byteCount})`
}

function parseDigQuery(args: string[]) {
  const queryToken = args.find((arg) => !arg.startsWith('@') && !arg.startsWith('-') && !['AXFR', 'A', 'AAAA', 'TXT', 'MX', 'NS', 'SOA', 'PTR'].includes(arg.toUpperCase()) && !/^\d/.test(arg))
  return normalize(queryToken ?? '')
}

export function parseDnsCommand(state: DnsReconState, command: string): DnsReconState {
  const trimmed = command.trim()
  const next = structuredClone(state)
  const lines = [...next.terminalHistory]
  const prompt = '└─(analyst㉿kali)-[~]$'
  const add = (text: string, kind: TerminalLine['kind'] = 'output') => lines.push(createLine(text, kind))

  if (!trimmed) return next
  lines.push(createLine(trimmed, 'input', prompt))

  const parts = trimmed.split(/\s+/)
  const tool = parts[0].toLowerCase()
  const args = parts.slice(1)

  if (tool === 'help') {
    add('Available tools: nslookup, dig, host', 'system')
    add('Required evidence: DNS enumeration, server identity, AXFR exposure, flag host discovery, targeted TXT retrieval, and flag submission.', 'output')
  } else if (tool === 'nslookup' && args.length === 0) {
    add('Default Server: resolver.internal.lab', 'success')
    add(`Address:  ${resolver}`, 'output')
    add('Optional reconnaissance tool. This result does not affect challenge completion.', 'system')
  } else if (tool === 'dig') {
    const query = parseDigQuery(args)
    const isReverse = args.some((arg) => arg.toLowerCase() === '-x')
    const isAxfr = args.some((arg) => arg.toUpperCase() === 'AXFR')
    const recordType = [...args].reverse().find((arg) => ['A', 'AAAA', 'TXT', 'MX', 'NS', 'SOA', 'PTR'].includes(arg.toUpperCase()))?.toUpperCase() ?? 'A'
    const usesResolver = args.some((arg) => arg.toLowerCase() === `@${resolver}`)
    const server = usesResolver ? resolver : resolver

    if (isReverse && args.includes(resolver)) {
      next.discovered.dnsServerIdentity = true
      add(`${digHeader(args.join(' '))}\n\n;; QUESTION SECTION:\n;${resolver}.                 IN      PTR\n\n;; ANSWER SECTION:\n53.0.20.10.in-addr.arpa. 300 IN PTR resolver.internal.lab.\n\n${digFooter(server, 'UDP', 95)}`)
      addExplanation(lines, 'We performed a reverse DNS lookup against the DNS server IP address. Reverse DNS maps an IP address back to a hostname, helping an ethical hacker understand the role of an internal system and confirm that the address belongs to the DNS infrastructure. Notice that 10.20.0.53 maps to resolver.internal.lab, identifying the server as the lab resolver.')
    } else if (isAxfr && usesResolver && query === 'internal.lab' && !isReverse) {
      next.discovered.zoneTransfer = true
      next.discovered.dnsServerIdentity = true
      next.discovered.flagHostDiscovered = true
      add(`; <<>> DiG 9.19.21-1+b1-Debian <<>> ${args.join(' ')}\n; (1 server found)\n;; global options: +cmd\ninternal.lab.             900 IN SOA ns1.internal.lab. hostmaster.internal.lab. 8 900 300 604800 900\ninternal.lab.             900 IN NS  ns1.internal.lab.\nns1.internal.lab.         900 IN A   10.20.0.53\ninternal.lab.             900 IN A   10.20.30.10\nportal.internal.lab.      900 IN A   10.20.30.10\nops-console.internal.lab. 900 IN A   10.20.30.77\nops-console.internal.lab. 900 IN TXT "legacy-admin-console exposed to lab network"\nresolver.internal.lab.    900 IN A   10.20.0.53\nflag.internal.lab.        900 IN A   ${flagHostAddress}\ninternal.lab.             900 IN SOA ns1.internal.lab. hostmaster.internal.lab. 8 900 300 604800 900\n\n${axfrFooter(server, 10, 410)}`)
      add(';; WARNING: zone transfer permitted to an unauthorized client.', 'error')
      addExplanation(lines, 'We attempted a DNS zone transfer (AXFR). Zone transfers normally synchronize data between authorized DNS servers; AXFR is not inherently malicious. The security issue here is incorrect access control: an unauthorized Kali client can download the zone. Notice that ns1.internal.lab, portal.internal.lab, ops-console.internal.lab, resolver.internal.lab, and flag.internal.lab are exposed. The flag host appears as an A record only; the completion flag is intentionally withheld from AXFR and requires a targeted TXT query.')
    } else if (query === 'internal.lab' && !isReverse && !isAxfr && recordType === 'A') {
      next.discovered.forwardLookup = true
      next.discovered.dnsServerIdentity = true
      add(`${digHeader(args.join(' '))}\n\n;; QUESTION SECTION:\n;internal.lab.                  IN      A\n\n;; ANSWER SECTION:\ninternal.lab.           300     IN      A       10.20.30.10\n\n;; AUTHORITY SECTION:\ninternal.lab.           300     IN      NS      ns1.internal.lab.\n\n;; ADDITIONAL SECTION:\nns1.internal.lab.       300     IN      A       10.20.0.53\n\n${digFooter(server, 'UDP', 128)}`)
      addExplanation(lines, 'We queried the internal.lab domain to begin DNS reconnaissance. The response provides information about the domain and its DNS infrastructure. In an authorized penetration test, DNS can reveal internal naming and infrastructure useful for further enumeration. Notice the A record, ns1.internal.lab, and 10.20.0.53.')
    } else if (query === 'flag.internal.lab' && usesResolver && recordType === 'TXT' && !isReverse && !isAxfr) {
      if (next.discovered.zoneTransfer) {
        next.discovered.flagRetrieved = true
        add(`${digHeader(trimmed)}\n\n;; QUESTION SECTION:\n;flag.internal.lab.             IN      TXT\n\n;; ANSWER SECTION:\nflag.internal.lab.      60      IN      TXT     "${flag}"\n\n${digFooter(server, 'UDP', 101)}`, 'success')
        addExplanation(lines, 'The zone transfer revealed the hostname flag.internal.lab. We queried that specific TXT record through the same DNS server, demonstrating how reconnaissance evidence supports a targeted follow-up query. The AXFR response did not contain the flag value; this targeted TXT query is the operation that retrieves it.')
      } else {
        add(`${digHeader(trimmed).replace('status: NOERROR', 'status: NXDOMAIN')}\n\n;; QUESTION SECTION:\n;flag.internal.lab.             IN      TXT\n\n${digFooter(server, 'UDP', 78)}`, 'error')
      }
    } else if (query === 'flag.internal.lab' && recordType === 'A') {
      add(`${digHeader(args.join(' '))}\n\n;; QUESTION SECTION:\n;flag.internal.lab.             IN      A\n\n;; ANSWER SECTION:\nflag.internal.lab.      900     IN      A       ${flagHostAddress}\n\n${digFooter(server, 'UDP', 86)}`)
    } else if (query === 'flag.internal.lab') {
      add(`${digHeader(args.join(' '))}\n\n;; QUESTION SECTION:\n;flag.internal.lab.             IN      ${recordType}\n\n;; AUTHORITY SECTION:\ninternal.lab.           900     IN      SOA     ns1.internal.lab. hostmaster.internal.lab. 8 900 300 604800 900\n\n${digFooter(server, 'UDP', 98)}`)
    } else {
      add(`${digHeader(trimmed).replace('status: NOERROR', 'status: NXDOMAIN')}\n\n;; QUESTION SECTION:\n;${query || 'unknown.internal.lab'}.             IN      ${recordType}\n\n;; AUTHORITY SECTION:\ninternal.lab.           900     IN      SOA     ns1.internal.lab. hostmaster.internal.lab. 8 900 300 604800 900\n\n${digFooter(server, 'UDP', 98)}`, 'error')
    }
  } else if (tool === 'host') {
    const hostTarget = normalize(args[args.length - 1] ?? '')
    if (hostTarget === 'ops-console.internal.lab') {
      add('ops-console.internal.lab has address 10.20.30.77', 'output')
      add('Optional reconnaissance only. This command is not required for completion.', 'system')
    } else {
      add(`Host ${hostTarget || 'query'} not found: 3(NXDOMAIN)`, 'error')
    }
  } else {
    add(`${tool}: command not available in this lab. Try help.`, 'error')
  }

  next.terminalHistory = lines
  next.objectives = objectivesFor(next)
  return next
}

export function normalizeDnsFlagSubmission(submission: string): string {
  return submission.trim()
}

export function isValidDnsFlag(submission: string): boolean {
  return normalizeDnsFlagSubmission(submission) === flag
}

export function submitDnsFlag(state: DnsReconState, submission: string): DnsReconState {
  const next = structuredClone(state)
  const lines = [...next.terminalHistory]
  const value = normalizeDnsFlagSubmission(submission)
  if (!next.discovered.flagRetrieved) {
    lines.push(createLine('Flag submission rejected: retrieve the flag through the required DNS evidence first.', 'error'))
  } else if (!isValidDnsFlag(value)) {
    lines.push(createLine('Flag submission rejected: value does not match the retrieved lab flag.', 'error'))
  } else {
    next.flagSubmitted = true
    lines.push(createLine('Flag accepted. DNS reconnaissance challenge complete.', 'success'))
  }
  next.terminalHistory = lines
  next.objectives = objectivesFor(next)
  return next
}

export { flag as dnsReconFlag }
