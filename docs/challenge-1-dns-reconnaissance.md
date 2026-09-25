# Challenge 1 - DNS Reconnaissance: Detailed Solution

## Purpose

This is the instructor solution for the browser-based DNS Reconnaissance lab. The learner investigates a fictional internal DNS service from a simulated Kali Linux terminal. The browser never sends DNS requests to a real network and never executes commands on the host operating system.

The required investigation uses only four DNS commands. Optional tools remain available for exploration, but they never affect completion. The simulator intentionally keeps the completion flag outside the AXFR-visible records; AXFR reveals the flag hostname, and the targeted TXT query reveals the flag value.

## Lab Facts

| Item | Value |
| --- | --- |
| Simulated Kali workstation | `analyst` at `10.20.0.10` |
| Prompt | `└─(analyst㉿kali)-[~]$` |
| DNS server / Technitium DNS | `10.20.0.53` |
| DNS zone | `internal.lab` |
| Domain A record | `internal.lab -> 10.20.30.10` |
| Resolver name | `resolver.internal.lab` |
| Authoritative name server | `ns1.internal.lab` |
| AXFR-visible flag host | `flag.internal.lab A 10.20.30.88` |
| Targeted flag record | `flag.internal.lab TXT` |
| Flag | `CYBERLAB{dns_recon_complete}` |

## Required Evidence

The lab does not use a rigid command checklist. It evaluates the evidence produced by valid queries:

1. A successful forward query for `internal.lab`.
2. DNS server identity established from `ns1.internal.lab` or `10.20.0.53`.
3. A successful AXFR query for the `internal.lab` zone.
4. `flag.internal.lab` discovered through AXFR.
5. A successful targeted query for `flag.internal.lab TXT` through `10.20.0.53`.
6. The exact flag is submitted in the Lab Status panel.

The evidence items are independent where the evidence permits it. The intended reasoning path is forward lookup, identify DNS infrastructure, AXFR, discover the flag host, targeted TXT query, then flag submission.

## Step 0 - Reset the Lab

Open `/challenges/dns-reconnaissance` and click **Reset lab**. A clean session shows `0/6` required evidence and a locked flag submission area.

Reset clears terminal history, evidence state, hints, and flag submission state. Use it before an instructor demonstration or a retry.

## Step 1 - Initial DNS Enumeration

### Required command

```bash
dig internal.lab
```

### Expected simulated output

```text
;; ANSWER SECTION:
internal.lab. 300 IN A 10.20.30.10
;; AUTHORITY SECTION:
internal.lab. 300 IN NS ns1.internal.lab.
ns1.internal.lab. 300 IN A 10.20.0.53
```

### What did we do?

We queried the `internal.lab` domain to begin DNS reconnaissance. The query performs a forward lookup and asks DNS to map a name to an IPv4 address.

### What does the output tell us?

Important observations are:

- `internal.lab` has an A record of `10.20.30.10`.
- `ns1.internal.lab` is listed as the authoritative name server.
- `ns1.internal.lab` resolves to `10.20.0.53`.
- `10.20.0.53` is the DNS infrastructure address we should investigate next.

### Why is this useful to an ethical hacker?

DNS can disclose internal naming conventions, address ranges, authoritative servers, and the roles of infrastructure systems. In an authorized penetration test, this information helps an analyst choose focused follow-up queries instead of guessing at internal assets.

### What should we notice before continuing?

The response identifies both the domain's authoritative server and its IP address. The next useful question is: what hostname belongs to that IP address?

### Evidence recorded

The **Identify internal DNS information** objective is complete. This evidence is based on the returned A and NS records, not merely on the text of the command.

## Step 2 - Reverse DNS Lookup

### Required command

```bash
dig -x 10.20.0.53
```

### Expected simulated output

```text
;; ANSWER SECTION:
53.0.20.10.in-addr.arpa. 300 IN PTR resolver.internal.lab.
```

### What did we do?

We performed a reverse DNS lookup against the DNS server's IP address. The `-x` option asks `dig` to map an IP address back to a hostname.

### What does the output tell us?

The reverse record maps:

```text
10.20.0.53 -> resolver.internal.lab
```

The reversed `in-addr.arpa` name is normal DNS notation for an IPv4 reverse lookup. The `PTR` record identifies the address as `resolver.internal.lab`.

### Why is this useful to an ethical hacker?

Reverse DNS can help an analyst understand the role of an internal system, validate host identity, and connect an IP address discovered during enumeration to an operational hostname. It also confirms that the address belongs to the lab's DNS infrastructure.

### What should we notice before continuing?

`resolver.internal.lab` is not just another host. It is the resolver identified in the first query and the server that should be tested for an overly permissive zone-transfer configuration.

### Evidence recorded

The **Confirm the DNS server identity** objective is complete because the expected PTR record was returned.

## Step 3 - DNS Zone Transfer

### Required command

```bash
dig @10.20.0.53 internal.lab AXFR
```

### Command breakdown

- `dig` is the DNS query utility.
- `@10.20.0.53` sends the query to the DNS server discovered in Steps 1 and 2.
- `internal.lab` is the zone being tested.
- `AXFR` requests a full authoritative zone transfer.

### Expected simulated output

```text
;; AXFR response from resolver.internal.lab.
internal.lab.             300 IN SOA ns1.internal.lab. hostmaster.internal.lab.
internal.lab.             300 IN NS  ns1.internal.lab.
ns1.internal.lab.         300 IN A   10.20.0.53
portal.internal.lab.      300 IN A   10.20.30.10
ops-console.internal.lab. 300 IN A   10.20.30.77
resolver.internal.lab.    300 IN A   10.20.0.53
flag.internal.lab.        900 IN A   10.20.30.88
;; WARNING: zone transfer permitted to an unauthorized client.
```

### What did we do?

We attempted a DNS zone transfer, also called AXFR. An AXFR request asks an authoritative server for the complete contents of a DNS zone.

### What does the output tell us?

The transfer exposes multiple internal records:

- `ns1.internal.lab`: authoritative DNS server.
- `portal.internal.lab`: portal host at `10.20.30.10`.
- `ops-console.internal.lab`: administrative-looking host at `10.20.30.77`.
- `resolver.internal.lab`: resolver at `10.20.0.53`.
- `flag.internal.lab`: A record at `10.20.30.88`, which reveals the flag host without revealing the flag value.

### Important security concept

AXFR is not inherently malicious. Authorized secondary DNS servers legitimately use zone transfers to synchronize DNS data. The security issue in this lab is incorrect access control: an unauthorized Kali client can obtain the entire zone.

### Why is this useful to an ethical hacker?

A permitted zone transfer can expose hostnames, server roles, address ranges, and sensitive naming conventions in one response. The names above give an analyst targeted, evidence-based follow-up paths. For example, `ops-console.internal.lab` suggests an administrative asset, while `flag.internal.lab` identifies the next targeted TXT query. The simulator intentionally withholds the flag TXT value from AXFR so the targeted query remains meaningful; this is a lab-specific behavior, not ordinary BIND semantics.

### What should we notice before continuing?

The zone transfer has revealed `flag.internal.lab`. We can now query that exact record instead of performing optional host discovery or guessing at names.

### Evidence recorded

The **Detect unauthorized zone-transfer exposure** objective is complete when a valid AXFR response containing the internal zone records is returned.

## Step 4 - Retrieve and Submit the Flag

### Required command

```bash
dig @10.20.0.53 flag.internal.lab TXT
```

The resolver may be placed elsewhere in the valid `dig` argument order, but the query must target `flag.internal.lab`, request `TXT`, and use `10.20.0.53`.

### Expected simulated output

```text
;; ANSWER SECTION:
flag.internal.lab. 60 IN TXT "CYBERLAB{dns_recon_complete}"
```

### What did we do?

The zone transfer revealed the hostname `flag.internal.lab`. We queried that specific TXT record through the same DNS server to retrieve its value.

### What does the output tell us?

The TXT record contains:

```text
CYBERLAB{dns_recon_complete}
```

This demonstrates how information discovered during reconnaissance enables a targeted follow-up query.

### Why is this useful to an ethical hacker?

Reconnaissance is valuable because it turns broad uncertainty into specific, testable knowledge. The AXFR result gave us the exact hostname, record type, and resolver needed for this query.

### What should we notice before continuing?

Retrieving the flag is not the same as submitting it. Copy the exact value, including braces and capitalization, into the **Flag submission** field in the Lab Status panel and click **Submit**.

### Completion result

After the exact flag is submitted:

- Progress changes to `6/6`.
- The flag submission is accepted.
- The status changes to the successful completion state.

## Complete Required Command Sequence

Only these four commands are required:

```bash
dig internal.lab
dig -x 10.20.0.53
dig @10.20.0.53 internal.lab AXFR
dig @10.20.0.53 flag.internal.lab TXT
```

## Optional Reconnaissance Commands

These commands remain available but never affect completion:

```bash
nslookup
host ops-console.internal.lab
dig @10.20.0.53 ops-console.internal.lab TXT
```

They can provide additional context, but the learner must not be forced to run them. The challenge is complete without them; host discovery and flag retrieval are tracked separately from AXFR and submission.

## Common Mistakes

### Querying the flag before discovering the zone

The flag query is evidence-gated. If the AXFR evidence has not been recorded, the simulator will not return the flag value. This teaches the relationship between discovery and targeted follow-up.

### Treating AXFR as automatically malicious

AXFR is a legitimate DNS synchronization mechanism. The finding is that this server permits an unauthorized client to use it. Focus the security conclusion on access control and information exposure.

### Running optional commands as if they were required

`nslookup`, `host`, and the optional `ops-console` TXT query do not increment the required evidence count. They are exploration tools only.

### Submitting the wrong flag

The submission must exactly match:

```text
CYBERLAB{dns_recon_complete}
```

The parser rejects incorrect values and leaves the challenge incomplete.

### Resetting for another attempt

Click **Reset lab** to clear the terminal history and all evidence. The progress should return to `0/6`, and the flag submission field should be locked again.

## Progressive Hints

Hints guide reasoning rather than exposing the answer:

1. Start by querying the internal domain with a DNS enumeration tool.
2. Use `dig` to query `internal.lab` and inspect the answer and authority sections.
3. The DNS server may expose more information than a normal A record query.
4. Research the DNS operation used to transfer an entire zone.
5. Try an AXFR query against the `internal.lab` zone.
6. The zone transfer reveals `flag.internal.lab`; query its TXT record through the same resolver.

No hint reveals the flag value.

## VMware Kali Parity

The real authorized lab uses:

- Kali Linux at `10.20.0.10`.
- Technitium DNS at `10.20.0.53`.
- An isolated VMware host-only or custom network.
- The `internal.lab` zone.
- AXFR intentionally permitted from the Kali VM for this exercise.

The equivalent real Kali commands are:

```bash
dig internal.lab
dig -x 10.20.0.53
dig @10.20.0.53 internal.lab AXFR
dig @10.20.0.53 flag.internal.lab TXT
```

Do not connect the practice network to production or use these commands against unauthorized systems. The website remains independent of VMware and deterministically reproduces the same evidence.
