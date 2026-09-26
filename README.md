# CYBERLAB

CYBERLAB is an isolated educational penetration-testing laboratory for Northstar Logistics. The platform is designed around real HTTP handlers, browser targets, API behavior, cookies, sessions, and independently resettable challenge state.

## Curriculum

The current curriculum is:

1. **Broken Access Control / IDOR** - `hr.internal.lab`
2. **Authentication & Session Security** - `portal.internal.lab`
3. **SSRF & Internal Service Discovery** - `scanner.internal.lab`
4. **API Security & Mass Assignment** - `api.internal.lab`
5. **Linux Privilege Escalation** - `10.20.40.10`

The lab network is fictional and scoped to `10.20.0.0/16`. No requests should be sent to public websites, real organizations, or external infrastructure.

## Implemented Targets

Challenge 1 currently includes a real Next.js employee-portal-style HTTP target and backend API. The target processes requests server-side, maintains an HTTP session cookie, exposes realistic status codes, and records progress from backend interactions.

Challenge 2 documentation defines a separate password-reset/session-security lab. Challenges 3 through 5 are cataloged as planned services and require isolated service implementations before they should be marked available.

## Development

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

Open `http://localhost:3000` after starting the development server.

## Documentation

- [Challenge 1 - Broken Access Control](docs/challenge-1-broken-access-control.md)
- [Challenge 2 - Authentication & Session Security](docs/challenge-2-authentication-session-security.md)

The frontend provides the laboratory interface. Vulnerability behavior belongs in the target service boundary and must not be implemented as command recognition or frontend-only flag detection.
