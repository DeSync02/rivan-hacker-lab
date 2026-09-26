import { NextResponse } from 'next/server'

const portalFlag = 'CYBERLAB{web_auth_bypass}'
const sessions = new Map<string, { robots: boolean; javascript: boolean; idor: boolean; briefing: boolean }>()

type PortalContext = { params: Promise<{ path: string[] }> }

function getSession(request: Request) {
  const cookie = request.headers.get('cookie')?.match(/portal_session=([^;]+)/)?.[1] ?? crypto.randomUUID()
  const progress = sessions.get(cookie) ?? { robots: false, javascript: false, idor: false, briefing: false }
  sessions.set(cookie, progress)
  return { cookie, progress }
}

function response(body: unknown, init: ResponseInit = {}, cookie?: string) {
  const result = NextResponse.json(body, init)
  if (cookie) result.cookies.set('portal_session', cookie, { httpOnly: true, sameSite: 'lax', path: '/' })
  return result
}

export async function GET(request: Request, context: PortalContext) {
  const { path = [] } = await context.params
  const endpoint = `/${path.join('/')}`
  const { cookie, progress } = getSession(request)

  if (endpoint === '/robots.txt') {
    progress.robots = true
    return response({ content: 'User-agent: *\nDisallow: /api/internal\nDisallow: /api/user\nDisallow: /api/briefing' }, {}, cookie)
  }

  if (endpoint === '/app.js') {
    progress.javascript = true
    return response({ content: 'const directoryEndpoint = "/api/user?id=";\nconst supportMailbox = "support@northstar.internal";' }, {}, cookie)
  }

  if (endpoint === '/api/user') {
    const id = new URL(request.url).searchParams.get('id')
    if (!id) return response({ error: 'employee id is required' }, { status: 400 }, cookie)
    progress.idor = id === '1001'
    return response({ id, name: id === '1001' ? 'Mara Ellison' : 'Directory record', department: id === '1001' ? 'Operations' : 'Unknown', role: id === '1001' ? 'Portal Administrator' : 'Employee', email: id === '1001' ? 'mara.ellison@northstar.internal' : null }, {}, cookie)
  }

  if (endpoint === '/api/briefing') {
    if (!progress.idor) return response({ error: 'authentication required' }, { status: 401 }, cookie)
    progress.briefing = true
    return response({ title: 'Operations briefing', owner: 'Mara Ellison', finding: 'The portal trusts the employee id supplied by the client.', flag: portalFlag }, {}, cookie)
  }

  if (endpoint === '/api/progress') return response({ ...progress }, {}, cookie)

  return response({ error: 'not found' }, { status: 404 }, cookie)
}

export async function POST(request: Request, context: PortalContext) {
  const { path = [] } = await context.params
  const endpoint = `/${path.join('/')}`
  const { cookie, progress } = getSession(request)
  if (endpoint === '/reset') {
    sessions.delete(cookie)
    const result = response({ reset: true }, {}, crypto.randomUUID())
    result.cookies.set('portal_session', '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 })
    return result
  }
  if (endpoint === '/login') return response({ error: 'Invalid username or password' }, { status: 401 }, cookie)
  if (endpoint === '/submit') {
    const body = await request.json().catch(() => ({})) as { flag?: string }
    if (!progress.briefing) return response({ accepted: false, error: 'The restricted briefing has not been accessed.' }, { status: 403 }, cookie)
    if (body.flag?.trim() !== portalFlag) return response({ accepted: false, error: 'Flag rejected.' }, { status: 400 }, cookie)
    return response({ accepted: true }, {}, cookie)
  }
  return response({ error: 'not found' }, { status: 404 }, cookie)
}