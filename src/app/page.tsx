'use client';

import React, { useState } from 'react';
import { ObjectGraphHUD } from '@/components/graph/ObjectGraphHUD';
import { PSMASRadar } from '@/components/psmas/PSMASRadar';
import { DiffViewer } from '@/components/editor/DiffViewer';
import { TokenTelemetry } from '@/components/telemetry/TokenTelemetry';
import { SWEBenchCard } from '@/components/telemetry/SWEBenchCard';
import { SafeApprovalModal } from '@/components/editor/SafeApprovalModal';
import { AgentTimeline } from '@/components/psmas/AgentTimeline';
import { Screen15Overview } from '@/components/layout/Screen15Overview';
import { LayoutGrid, ShieldCheck, Zap } from 'lucide-react';
import { useOmniStore } from '@/lib/store/useOmniStore';

export default function OmniGraphStudio() {
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const openApprovalModal = useOmniStore(state => state.openApprovalModal);
  const telemetry = useOmniStore(state => state.telemetry);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden select-none bg-[#0d1117] text-[#e6edf3] p-3 gap-2">

      {/* ── Top Header Bar ── */}
      <header className="h-8 shrink-0 flex items-center justify-between border-b border-[#30363d] pb-2 font-sans">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#3fb950] animate-pulse" />
          <span className="text-sm font-bold font-mono tracking-tight text-[#e6edf3]">
            OMNIGRAPH STUDIO
          </span>
          <span className="text-[10px] text-[#8b949e] font-mono">
            Open Gigantic &bull; Superbrain TokenFold Engine
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Token Reduction Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#16291e] border border-[#238636]/60 text-[#3fb950] text-xs font-mono">
            <Zap className="w-3 h-3 text-[#3fb950]" />
            <span>{telemetry.savingsPercentage}% Token Reduction</span>
          </div>

          {/* 15 Screens Gallery Trigger */}
          <button
            onClick={() => setIsOverviewOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-xs text-[#8b949e] hover:text-[#e6edf3] font-medium transition-colors"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-[#58a6ff]" />
            <span>All 15 Screens</span>
          </button>

          {/* Human-in-the-Loop Safe Barrier Modal */}
          <button
            onClick={openApprovalModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1b3127] hover:bg-[#238636] border border-[#238636] text-xs text-[#3fb950] hover:text-white font-medium transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Safe Barrier</span>
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* Main 2x2 Grid (strictly matches Reference Screen 2)       */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <main className="flex-1 grid grid-cols-2 gap-3 min-h-0 overflow-hidden">

        {/* ┌────────────────────────────────────────────────────┐ */}
        {/* │  TOP LEFT: Object Graph HUD (Card 1)              │ */}
        {/* └────────────────────────────────────────────────────┘ */}
        <section className="rounded-xl overflow-hidden bg-[#161b22] border border-[#30363d] shadow-2xl flex flex-col min-h-0">
          <ObjectGraphHUD />
        </section>

        {/* ┌────────────────────────────────────────────────────┐ */}
        {/* │  TOP RIGHT: PSMAS Manifold Radar (Card 2)         │ */}
        {/* └────────────────────────────────────────────────────┘ */}
        <section className="rounded-xl overflow-hidden bg-[#161b22] border border-[#30363d] shadow-2xl flex flex-col min-h-0">
          <PSMASRadar />
        </section>

        {/* ┌────────────────────────────────────────────────────┐ */}
        {/* │  BOTTOM LEFT: Surgical Diff Picker (Card 3)       │ */}
        {/* └────────────────────────────────────────────────────┘ */}
        <section className="rounded-xl overflow-hidden bg-[#161b22] border border-[#30363d] shadow-2xl flex flex-col min-h-0">
          <DiffViewer />
        </section>

        {/* ┌────────────────────────────────────────────────────┐ */}
        {/* │  BOTTOM RIGHT: Token Telemetry + SWE-bench        │ */}
        {/* └────────────────────────────────────────────────────┘ */}
        <section className="grid grid-cols-2 gap-3 min-h-0 overflow-hidden">
          <div className="rounded-xl overflow-hidden bg-[#161b22] border border-[#30363d] shadow-2xl flex flex-col min-h-0">
            <TokenTelemetry />
          </div>
          <div className="rounded-xl overflow-hidden bg-[#161b22] border border-[#30363d] shadow-2xl flex flex-col min-h-0">
            <SWEBenchCard />
          </div>
        </section>
      </main>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* Agent Activity Timeline (horizontal bottom strip)         */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <footer className="shrink-0">
        <AgentTimeline />
      </footer>

      {/* Human-in-the-Loop Safe Approval Barrier Modal */}
      <SafeApprovalModal />

      {/* 15 Core System Screens Modal */}
      <Screen15Overview
        isOpen={isOverviewOpen}
        onClose={() => setIsOverviewOpen(false)}
      />
    </div>
  );
}
