# CyberLab

CyberLab is a browser-only educational laboratory for authorized, isolated red-team exercises. The website simulates a Kali Linux workstation; it does not claim to run Kali Linux in the browser and it never sends learner commands to a real operating system or external target.

## Current Scope

Only Challenge 1 is implemented:

# Challenge 1 — DNS Reconnaissance

## Overview

The learner performs a small DNS investigation against the fictional `internal.lab` enterprise domain. Starting with limited context, they identify the resolver, inspect forward and reverse records, detect an exposed zone transfer, investigate a suspicious administrative host, and retrieve a completion flag.

## Learning Objectives

- Identify a DNS resolver and understand its role in name resolution.
- Use forward lookups to map names to addresses.
- Use reverse lookups to map an address back to a host.
- Recognize zone transfer exposure as a DNS misconfiguration.
- Identify suspicious DNS disclosures and basic attack indicators.
- Practice authorized information gathering with Kali terminology.

## Course Alignment

This challenge covers the Day 2 CompTIA Security+ SY0-701 topics of DNS records, name resolution, forward lookup, reverse lookup, common DNS services, suspicious DNS activity, DNS misconfiguration, and basic DNS attack indicators.

## Scenario

An authorized security analyst has access to a simulated Kali Linux workstation inside an isolated enterprise lab. The fictional organization uses `internal.lab`, but the analyst has not been given the resolver address or a host inventory. All targets and records are invented for this exercise.

## Lab Environment

- Kali Linux simulator: browser UI with a realistic `analyst` prompt.
- DNS resolver: `resolver.internal.lab` at `10.20.0.53`.
- Domain: `internal.lab`.
- Known forward record: `internal.lab` resolves to `10.20.30.10`.
- Authoritative record: `ns1.internal.lab` resolves to `10.20.0.53`.
- Discovered host: `ops-console.internal.lab` resolves to `10.20.30.77`.
- Services: simulated DNS service only; no real network requests are made.

## Tools Used

The required path uses `dig` for forward, reverse, AXFR, and TXT queries. `nslookup` and `host` remain available as optional reconnaissance tools and never affect completion.

## Challenge Flow

1. Run `dig internal.lab` to identify the domain and DNS infrastructure.
2. Run `dig -x 10.20.0.53` to confirm the resolver hostname.
3. Test the discovered authoritative server with `dig @10.20.0.53 internal.lab AXFR`.
4. Query the discovered flag record with `dig @10.20.0.53 flag.internal.lab TXT`, then submit the returned value.

Completion is evidence-based: the simulator requires successful forward, reverse, AXFR, and flag TXT results plus the exact flag submission. Optional commands do not count toward completion.

## Hint System

1. Start by querying the internal domain with a DNS enumeration tool.
2. Use `dig` to query `internal.lab` and inspect the answer and authority sections.
3. The DNS server may expose more information than a normal A record query.
4. Research the DNS operation used to transfer an entire zone.
5. Try an AXFR query against the `internal.lab` zone.
6. Query the `flag.internal.lab` TXT record through the discovered resolver.

## Flag

Internal development value: `CYBERLAB{dns_recon_complete}`. This value is not shown in the learner-facing scenario, objective list, or hints before completion.

## Completion Criteria

The challenge is complete only when the simulator records successful forward, reverse, AXFR, and flag TXT evidence and the learner submits `CYBERLAB{dns_recon_complete}` exactly. `nslookup`, `host`, and the optional `ops-console` TXT query are not required.

## VMware Kali Version

To reproduce the exercise later, create an isolated VMware host-only network with a Kali Linux VM and a controlled DNS server VM or service. Configure the DNS server as authoritative for `internal.lab` at `10.20.0.53`, add the documented records, and intentionally allow AXFR from the Kali lab IP for the exercise. Do not connect this network to production or the public Internet.

Equivalent required commands on Kali are:

```bash
dig internal.lab
dig -x 10.20.0.53
dig @10.20.0.53 internal.lab AXFR
dig @10.20.0.53 flag.internal.lab TXT
```

The website remains independent of VMware and uses deterministic simulated responses.

## Development

```bash
npm install
npm run dev
```

The full Challenge 1 runbook is in [docs/challenge-1-dns-reconnaissance.md](docs/challenge-1-dns-reconnaissance.md). Challenges 2–5 are intentionally not implemented in this iteration.
