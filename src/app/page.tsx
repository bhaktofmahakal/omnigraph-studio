'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Code,
  Network,
  Radio,
  GitPullRequest,
  BarChart3,
  Terminal,
  Users,
  Clock,
  Settings,
  ArrowRight,
  Zap,
  ShieldCheck,
  Sparkles,
  Play,
  FileCode,
  CheckCircle2,
} from 'lucide-react';
import { useOmniStore } from '@/lib/store/useOmniStore';

const MODULE_CARDS = [
  {
    href: '/ide',
    title: 'Monaco Code IDE',
    desc: 'Full-screen VS Code Monaco subsystem with multi-tab syntax editing & live surgical diff inspection.',
    icon: Code,
    badge: 'Screen 2',
    color: '#38bdf8',
    liveKey: 'files',
  },
  {
    href: '/graph',
    title: 'ObjectGraph AST Canvas',
    desc: 'Interactive @xyflow/react dependency graph with AST progressive disclosure & token footprint inspection.',
    icon: Network,
    badge: 'Screen 3',
    color: '#3fb950',
    liveKey: 'nodes',
  },
  {
    href: '/psmas',
    title: 'PSMAS Swarm Radar & Terminal',
    desc: 'Phase-Staggered Multi-Agent circular manifold execution radar & live streaming reasoning logs.',
    icon: Radio,
    badge: 'Screen 4',
    color: '#bc8cff',
    liveKey: 'agents',
  },
  {
    href: '/diff',
    title: 'Surgical Diff Picker',
    desc: 'Unified diff chunking engine for atomic single-hunk cherry picking ([Accept], [Reject], [Cherry-pick]).',
    icon: GitPullRequest,
    badge: 'Screen 5',
    color: '#d29922',
    liveKey: 'hunks',
  },
  {
    href: '/telemetry',
    title: 'TokenFold Telemetry & Benchmarks',
    desc: 'Context compression metrics, SVG donut analytics, interactive cost slider, and SWE-bench Lite comparison.',
    icon: BarChart3,
    badge: 'Screen 6',
    color: '#f85149',
    liveKey: 'telemetry',
  },
  {
    href: '/command',
    title: 'Command Center (⌘K)',
    desc: 'Typed AST traversal matrix, keyboard shortcut command palette, and quick symbol search.',
    icon: Terminal,
    badge: 'Screen 7',
    color: '#58a6ff',
    liveKey: 'commands',
  },
  {
    href: '/multiplayer',
    title: 'Multiplayer Hub',
    desc: 'Real-time collaborator presence, cursor synchronization, node locking, and swarm ping.',
    icon: Users,
    badge: 'Screen 8',
    color: '#a371f7',
    liveKey: 'collaborators',
  },
  {
    href: '/timeline',
    title: 'Agent Execution Timeline',
    desc: '6-stage agent activity sequence strip with clickable stage inspector (reasoning, files, tokens).',
    icon: Clock,
    badge: 'Screen 9',
    color: '#39d353',
    liveKey: 'timeline',
  },
  {
    href: '/settings',
    title: 'AI Model & BYOK Settings',
    desc: 'Configure OrcaRouter/Groq API keys, model selector, and live connection testing.',
    icon: Settings,
    badge: 'Screen 13',
    color: '#8b949e',
    liveKey: 'settings',
  },
];

export default function WorkspaceHome() {
  const telemetry = useOmniStore(state => state.telemetry);
  const activeScenario = useOmniStore(state => state.activeScenario);
  const nodes = useOmniStore(state => state.nodes);
  const diffHunks = useOmniStore(state => state.diffHunks);
  const files = useOmniStore(state => state.files);
  const agents = useOmniStore(state => state.agents);
  const collaborators = useOmniStore(state => state.collaborators);
  const logs = useOmniStore(state => state.logs);
  const isAgentRunning = useOmniStore(state => state.isAgentRunning);
  const startPSMASSweep = useOmniStore(state => state.startPSMASSweep);
  const openApprovalModal = useOmniStore(state => state.openApprovalModal);
  const router = useRouter();

  const pendingHunks = diffHunks.filter(h => h.status === 'pending').length;
  const completedAgents = agents.filter(a => a.status === 'completed').length;

  // Dynamic live badges for each module card
  const getLiveBadge = (key: string): string | null => {
    switch (key) {
      case 'files': return `${files.length} files`;
      case 'nodes': return `${nodes.length} AST nodes`;
      case 'agents': return `${completedAgents}/${agents.length} agents`;
      case 'hunks': return `${pendingHunks} pending`;
      case 'telemetry': return `${telemetry.savingsPercentage}% saved`;
      case 'commands': return `${nodes.length} symbols`;
      case 'collaborators': return `${collaborators.length} online`;
      case 'timeline': return `${logs.length} events`;
      case 'settings': return null;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0d1117] text-[#e6edf3] p-6 overflow-y-auto font-sans select-none space-y-6">
      {/* Hero Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#161b22] via-[#1c2128] to-[#161b22] border border-[#30363d] p-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-[#3fb950]">
            <Sparkles className="w-4 h-4" />
            <span>Open Gigantic (Superbrain) Assignment III</span>
          </div>

          <h1 className="text-2xl font-extrabold text-[#e6edf3] tracking-tight">
            OmniGraph Studio — Multi-Agent Graph-Traversal Engine
          </h1>

          <p className="text-sm text-[#8b949e] leading-relaxed">
            Operationalizing TokenFold Context Compression, ObjectGraph (.og) Typed AST Traversal, and Phase-Staggered Multi-Agent Swarm (PSMAS) Scheduling. Select a dedicated tool view below or launch the multi-agent sweep.
          </p>

          <div className="pt-3 flex items-center gap-4 text-xs font-mono flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#16291e] border border-[#238636] text-[#3fb950]">
              <Zap className="w-3.5 h-3.5" />
              <span>{telemetry.savingsPercentage}% Token Reduction</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1c2d42] border border-[#38bdf8]/40 text-[#58a6ff]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Active Scenario: {activeScenario.title}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Action Bar ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => { startPSMASSweep(); router.push('/psmas'); }}
          disabled={isAgentRunning}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3fb950] hover:bg-[#2ea043] text-[#0d1117] font-bold text-xs font-mono transition-all shadow-[0_0_12px_rgba(63,185,80,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Run Full Sweep</span>
        </button>

        <button
          onClick={() => router.push('/ide')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] font-medium text-xs font-mono border border-[#30363d] transition-all"
        >
          <Code className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>Open IDE</span>
        </button>

        <button
          onClick={() => router.push('/graph')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] font-medium text-xs font-mono border border-[#30363d] transition-all"
        >
          <Network className="w-3.5 h-3.5 text-[#3fb950]" />
          <span>Inspect AST Canvas</span>
        </button>

        {pendingHunks > 0 && (
          <button
            onClick={() => router.push('/diff')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2e2316] hover:bg-[#d29922]/20 text-[#d29922] font-medium text-xs font-mono border border-[#d29922]/40 transition-all"
          >
            <GitPullRequest className="w-3.5 h-3.5" />
            <span>Review {pendingHunks} Diffs</span>
          </button>
        )}

        <button
          onClick={openApprovalModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1b3127] hover:bg-[#238636] text-[#3fb950] font-medium text-xs font-mono border border-[#238636] transition-all"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Safe Barrier</span>
        </button>
      </div>

      {/* Grid of Dedicated Route Cards */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono font-semibold uppercase text-[#8b949e] tracking-wider">
          Dedicated System Screens & Tool Workspaces
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULE_CARDS.map((card) => {
            const Icon = card.icon;
            const liveBadge = getLiveBadge(card.liveKey);

            return (
              <Link
                key={card.href}
                href={card.href}
                className="group flex flex-col justify-between p-5 rounded-xl bg-[#161b22] border border-[#30363d] hover:border-[#58a6ff] hover:shadow-[0_0_20px_rgba(88,166,255,0.15)] transition-all duration-300"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center border border-[#30363d]"
                      style={{ backgroundColor: `${card.color}15`, borderColor: `${card.color}40` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: card.color }} />
                    </div>

                    <div className="flex items-center gap-2">
                      {liveBadge && (
                        <span
                          className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border"
                          style={{ color: card.color, borderColor: `${card.color}40`, backgroundColor: `${card.color}10` }}
                        >
                          {liveBadge}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-[#8b949e] bg-[#0d1117] px-2 py-0.5 rounded border border-[#30363d]">
                        {card.badge}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-[#e6edf3] group-hover:text-[#58a6ff] transition-colors">
                    {card.title}
                  </h3>

                  <p className="text-xs text-[#8b949e] leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="pt-4 flex items-center gap-1.5 text-xs font-mono font-medium text-[#58a6ff] group-hover:translate-x-1 transition-transform">
                  <span>Open Dedicated Screen</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
