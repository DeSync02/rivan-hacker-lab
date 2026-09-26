'use client'

import { FormEvent, useState } from 'react'

type Result = { [key: string]: unknown }

export default function ScannerTargetPage() {
  const [url, setUrl] = useState('http://scanner.internal.lab/health')
  const [result, setResult] = useState<Result>({})
  const scan = async (event: FormEvent) => { event.preventDefault(); const response = await fetch('/api/scanner/api/scan', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url }) }); setResult({ status: response.status, ...(await response.json()) }) }
  return <main className="min-h-screen bg-[#eef3f2] text-slate-800"><header className="border-b border-slate-200 bg-white px-6 py-5"><div className="mx-auto flex max-w-5xl items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Northstar Logistics</p><h1 className="mt-1 text-xl font-semibold">URL Inspection Service</h1></div><span className="font-mono text-xs text-slate-500">scanner.internal.lab</span></div></header><div className="mx-auto max-w-5xl px-6 py-10"><div className="max-w-2xl border border-slate-200 bg-white p-7"><p className="text-sm text-teal-700">External monitoring</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Inspect a service URL.</h2><p className="mt-3 text-sm leading-6 text-slate-500">The inspection worker retrieves the requested address and returns a diagnostic summary for the operations team.</p><form className="mt-7 space-y-3" onSubmit={scan}><label className="block text-xs font-bold uppercase tracking-[0.16em] text-slate-500" htmlFor="url">Service URL</label><div className="flex gap-2"><input id="url" className="min-w-0 flex-1 border border-slate-300 px-3 py-2 font-mono text-sm outline-none focus:border-teal-600" value={url} onChange={(event) => setUrl(event.target.value)} /><button className="bg-teal-700 px-4 py-2 text-sm font-medium text-white">Scan URL</button></div></form><pre className="mt-7 min-h-28 whitespace-pre-wrap break-words bg-slate-950 p-4 font-mono text-xs text-emerald-300">{JSON.stringify(result, null, 2)}</pre></div></div></main>
}
