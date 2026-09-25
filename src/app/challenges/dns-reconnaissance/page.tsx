'use client'

import { useEffect, useState } from 'react'
import { Check, ChevronRight, CircleHelp, Flag, RotateCcw, ShieldCheck, TerminalSquare } from 'lucide-react'
import { SimulatedTerminal } from '@/components/terminal/simulated-terminal'
import { dnsHints, dnsReconFlag, parseDnsCommand, resetDnsReconState, submitDnsFlag, type DnsReconState } from '@/simulator/challenges/dns-reconnaissance'

const storageKey = 'cyberlab-dns-reconnaissance-v3'

export default function DnsReconnaissancePage() {
  const [state, setState] = useState<DnsReconState>(() => resetDnsReconState())

  useEffect(() => {
    const saved = window.sessionStorage.getItem(storageKey)
    if (!saved) return
    try {
      setState(JSON.parse(saved))
    } catch {
      setState(resetDnsReconState())
    }
  }, [])

  useEffect(() => {
    window.sessionStorage.setItem(storageKey, JSON.stringify(state))
  }, [state])

  const completed = state.objectives.filter((objective) => objective.complete).length
  const completionPercent = Math.round((completed / state.objectives.length) * 100)
  const isComplete = state.discovered.flagRetrieved && state.flagSubmitted

  const reset = () => {
    const fresh = resetDnsReconState()
    setState(fresh)
    window.sessionStorage.setItem(storageKey, JSON.stringify(fresh))
  }

  return (
    <main className="min-h-screen bg-[#080b12] px-4 py-5 text-slate-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-5 border-b border-slate-800 pb-6">
          <div>
            <div className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
              <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.8)]" />
              CyberLab / authorized lab
            </div>
            <h1 className="font-mono text-3xl font-bold tracking-tight text-white sm:text-5xl">DNS Reconnaissance</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Investigate a fictional enterprise DNS environment from a simulated Kali Linux workstation. Every query stays inside this browser-based lab.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-200">Beginner</span>
            <button className="inline-flex items-center gap-2 border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white" onClick={reset}>
              <RotateCcw size={15} /> Reset lab
            </button>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0 space-y-5">
            <div className="grid gap-px border border-slate-800 bg-slate-800 sm:grid-cols-3">
              <div className="bg-[#0d121b] p-4"><p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Category</p><p className="mt-2 text-sm text-cyan-200">Red team / network reconnaissance</p></div>
              <div className="bg-[#0d121b] p-4"><p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Target scope</p><p className="mt-2 font-mono text-sm text-slate-200">internal.lab</p></div>
              <div className="bg-[#0d121b] p-4"><p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Environment</p><p className="mt-2 text-sm text-slate-200">Kali simulator / isolated</p></div>
            </div>

            <div className="border border-slate-800 bg-[#0d121b] p-3 sm:p-5">
              <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2"><TerminalSquare size={17} className="text-cyan-300" /><h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Kali terminal</h2></div>
                <span className="font-mono text-xs text-emerald-300">offline simulation</span>
              </div>
              <SimulatedTerminal lines={state.terminalHistory} prompt="└─(analyst㉿kali)-[~]$" label="KALI-LAB" onSubmit={(command) => setState((current) => parseDnsCommand(current, command))} />
            </div>

            <div className="border border-slate-800 bg-[#0d121b] p-5">
              <div className="mb-4 flex items-center gap-2"><ShieldCheck size={17} className="text-cyan-300" /><h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Reference / VMware parity</h2></div>
              <p className="text-sm leading-6 text-slate-400">This browser lab mirrors an isolated Kali exercise. The equivalent VMware setup uses Kali Linux, a private host-only network, and a controlled authoritative DNS server for `internal.lab`; no external targets are required.</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm text-cyan-300">Challenge 1 runbook: docs/challenge-1-dns-reconnaissance.md <ChevronRight size={15} /></span>
            </div>
          </section>

          <aside className="space-y-5">
            <section className="border border-slate-800 bg-[#0d121b] p-5">
              <div className="mb-4 flex items-center justify-between"><h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Required evidence</h2><span className="font-mono text-sm text-cyan-300">{completed}/{state.objectives.length}</span></div>
              <div className="mb-5 h-1 bg-slate-800"><div className="h-full bg-cyan-300 transition-all" style={{ width: `${completionPercent}%` }} /></div>
              <ul className="space-y-3">
                {state.objectives.map((objective) => <li className="flex items-start gap-3 text-sm" key={objective.id}><span className={objective.complete ? 'mt-0.5 text-emerald-300' : 'mt-0.5 text-slate-600'}>{objective.complete ? <Check size={16} /> : <span className="block h-4 w-4 rounded-full border border-slate-700" />}</span><span className={objective.complete ? 'text-slate-200' : 'text-slate-500'}>{objective.label}</span></li>)}
              </ul>
            </section>

            <section className="border border-slate-800 bg-[#0d121b] p-5">
              <div className="mb-3 flex items-center gap-2"><CircleHelp size={17} className="text-amber-300" /><h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Progressive hint</h2></div>
              <p className="text-sm leading-6 text-amber-100">{dnsHints[state.hintIndex]}</p>
              <button className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-amber-300 hover:text-amber-200" onClick={() => setState((current) => ({ ...current, hintIndex: Math.min(current.hintIndex + 1, dnsHints.length - 1) }))}>Reveal next hint</button>
            </section>

            <section className={`border p-5 ${isComplete ? 'border-emerald-400/50 bg-emerald-400/10' : 'border-slate-800 bg-[#0d121b]'}`}>
              <div className="mb-3 flex items-center gap-2"><Flag size={17} className={isComplete ? 'text-emerald-300' : 'text-slate-500'} /><h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Lab status</h2></div>
              {isComplete ? <><p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-200">Challenge Complete</p><code className="mt-4 block border border-emerald-300/30 bg-black/20 p-3 font-mono text-sm text-emerald-200">{dnsReconFlag}</code></> : state.discovered.flagRetrieved ? <><p className="text-sm leading-6 text-slate-400">Flag retrieved. Submit the exact value to complete the lab.</p><form className="mt-4 space-y-2" onSubmit={(event) => { event.preventDefault(); const input = event.currentTarget.elements.namedItem('flag') as HTMLInputElement; const submittedFlag = input.value; setState((current) => submitDnsFlag(current, submittedFlag)); input.value = '' }}><label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500" htmlFor="flag">Flag submission</label><div className="flex gap-2"><input id="flag" name="flag" autoComplete="off" className="min-w-0 flex-1 border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-emerald-200 outline-none focus:border-cyan-300" placeholder="CYBERLAB{...}" /><button className="border border-cyan-300/50 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-cyan-200 hover:bg-cyan-300/10" type="submit">Submit</button></div></form></> : <p className="text-sm leading-6 text-slate-500">The flag is locked. Complete the required DNS evidence to unlock submission.</p>}
            </section>
          </aside>
        </div>
      </div>
    </main>
  )
}