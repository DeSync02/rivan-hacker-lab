'use client'

import { FormEvent, useState } from 'react'

type Result = { content?: string; error?: string; [key: string]: unknown }

async function requestTarget(path: string, options?: RequestInit): Promise<Result> {
  const response = await fetch(`/api/portal/${path}`, options)
  return response.json()
}

export default function PortalTargetPage() {
  const [result, setResult] = useState<Result>({})
  const [employeeId, setEmployeeId] = useState('1000')
  const [login, setLogin] = useState({ username: '', password: '' })

  const show = async (path: string) => setResult(await requestTarget(path))
  const submitLogin = async (event: FormEvent) => {
    event.preventDefault()
    setResult(await requestTarget('login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(login) }))
  }

  return (
    <main className="min-h-screen bg-[#f3f5f4] text-slate-800">
      <header className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Northstar Logistics</p><h1 className="mt-1 text-xl font-semibold">Internal Operations Portal</h1></div><span className="text-xs text-slate-500">portal.internal.lab</span></div>
      </header>
      <div className="mx-auto grid max-w-5xl gap-6 px-6 py-8 lg:grid-cols-[1fr_340px]">
        <section className="space-y-6">
          <div className="border border-slate-200 bg-white p-6"><p className="text-sm text-teal-700">Operations workspace</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Keep the network moving.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">Review employee operations, coordinate support requests, and access the latest logistics status reports.</p><nav className="mt-6 flex flex-wrap gap-2 text-sm"><button className="border border-slate-300 px-3 py-2 hover:border-teal-600" onClick={() => show('robots.txt')}>Help center</button><button className="border border-slate-300 px-3 py-2 hover:border-teal-600" onClick={() => show('app.js')}>Employee directory</button></nav></div>
          <div className="border border-slate-200 bg-white p-6"><h2 className="font-semibold">Employee directory</h2><p className="mt-1 text-sm text-slate-500">Lookup an employee record for operational support.</p><form className="mt-4 flex gap-2" onSubmit={(event) => { event.preventDefault(); void show(`api/user?id=${encodeURIComponent(employeeId)}`) }}><input className="min-w-0 flex-1 border border-slate-300 px-3 py-2 font-mono text-sm outline-none focus:border-teal-600" value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} aria-label="Employee ID" /><button className="bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">Lookup</button></form></div>
          <div className="border border-slate-200 bg-white p-6"><h2 className="font-semibold">Operations briefing</h2><p className="mt-1 text-sm text-slate-500">Restricted internal communications for portal administrators.</p><button className="mt-4 border border-slate-300 px-3 py-2 text-sm hover:border-teal-600" onClick={() => show('api/briefing')}>Open briefing</button></div>
        </section>
        <aside className="border border-slate-200 bg-white p-6"><h2 className="font-semibold">Portal sign-in</h2><p className="mt-1 text-sm text-slate-500">Use your Northstar credentials to continue.</p><form className="mt-5 space-y-3" onSubmit={submitLogin}><input className="w-full border border-slate-300 px-3 py-2 text-sm" placeholder="Username" value={login.username} onChange={(event) => setLogin({ ...login, username: event.target.value })} /><input className="w-full border border-slate-300 px-3 py-2 text-sm" placeholder="Password" type="password" value={login.password} onChange={(event) => setLogin({ ...login, password: event.target.value })} /><button className="w-full bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">Sign in</button></form><div className="mt-6 border-t border-slate-200 pt-5"><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Server response</p><pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words bg-slate-950 p-4 font-mono text-xs text-emerald-300">{JSON.stringify(result, null, 2)}</pre></div></aside>
      </div>
    </main>
  )
}