'use client'

import { useEffect, useMemo, useState } from 'react'
import { AttackTopology } from '@/components/topology/attack-topology'
import { SimulatedTerminal } from '@/components/terminal/simulated-terminal'
import { FileBrowser } from '@/components/filesystem/file-browser'
import { challengeCatalog, parseChallengeCommand, resetChallengeState } from '@/simulator/core/engine'
import { evaluateObjectives } from '@/simulator/core/objectives'
import type { SimulatorState } from '@/types/simulator'

function DashboardCard({ id, title, difficulty, tags, status, available }: { id: string; title: string; difficulty: string; tags: string[]; status: string; available: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/30">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="text-sm text-slate-400">{difficulty}</p>
        </div>
        <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${available ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-700 text-slate-300'}`}>
          {status}
        </span>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="rounded-full border border-slate-700 bg-slate-800 px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-slate-300">
            {tag}
          </span>
        ))}
      </div>
      <button
        className={`w-full rounded-lg px-3 py-2 text-sm font-medium transition ${available ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950' : 'cursor-not-allowed bg-slate-800 text-slate-400'}`}
        disabled={!available}
        onClick={() => window.location.assign(`/challenges/${id}`)}
      >
        {available ? 'Launch Lab' : 'Coming Soon'}
      </button>
    </div>
  )
}

export default function HomePage() {
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-emerald-300">Security+ training suite</p>
          <h1 className="text-4xl font-bold text-white">Security+ Red Team Labs</h1>
          <p className="mt-2 text-slate-300">Hands-on CompTIA Security+ attack simulations</p>
        </header>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {challengeCatalog.map((challenge) => (
            <DashboardCard
              key={challenge.id}
              id={challenge.id}
              title={challenge.title}
              difficulty={challenge.difficulty}
              tags={challenge.tags}
              status={challenge.status}
              available={challenge.status === 'Available'}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
