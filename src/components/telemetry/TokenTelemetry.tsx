'use client';

import React, { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Cpu } from 'lucide-react';
import { useOmniStore } from '@/lib/store/useOmniStore';

export const TokenTelemetry: React.FC = () => {
  const telemetry = useOmniStore(state => state.telemetry);
  const [monthlyPRs, setMonthlyPRs] = useState(100);

  // SVG circular donut constants
  const size = 120;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.round(telemetry.savingsPercentage || 72);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Dynamic cost calculations based on slider
  const baselineCostPerPR = telemetry.baselineCostUSD || 0.104;
  const optimizedCostPerPR = telemetry.currentCostUSD || 0.065;
  const monthlySavings = ((baselineCostPerPR - optimizedCostPerPR) * monthlyPRs);
  const annualSavings = monthlySavings * 12;

  return (
    <div className="flex flex-col h-full bg-[#161b22] text-[#e6edf3] font-sans overflow-hidden select-none p-3 justify-between">
      {/* ── Header ── */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#e6edf3]" />
          <h2 className="text-xs font-semibold text-[#e6edf3] tracking-tight">
            Token Telemetry
          </h2>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[#8b949e] font-mono">
          <Cpu className="w-3 h-3" />
          <span>{telemetry.totalGraphNodes} nodes · {telemetry.traversalHops} hops</span>
        </div>
      </div>

      {/* ── Center Donut Chart ── */}
      <div className="flex-1 flex flex-col items-center justify-center py-1">
        <div className="relative flex items-center justify-center">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background Track Circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#21262d"
              strokeWidth={strokeWidth}
            />
            {/* Emerald Value Arc */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#3fb950"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out filter drop-shadow-[0_0_8px_rgba(63,185,80,0.4)]"
            />
          </svg>

          {/* Center Text inside Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-[#e6edf3] tracking-tight leading-none">
              {percentage}%
            </span>
            <span className="text-[9px] font-semibold text-[#8b949e] tracking-wider mt-0.5">
              TOKENS SAVED
            </span>
          </div>
        </div>
      </div>

      {/* ── Comparison Cards Grid ── */}
      <div className="grid grid-cols-2 gap-2 text-[11px] my-1">
        {/* Baseline (Claude Code) */}
        <div className="p-2 rounded-lg bg-[#0d1117] border border-[#30363d] flex flex-col">
          <span className="text-[10px] text-[#8b949e] font-medium truncate">
            Baseline (Claude Code)
          </span>
          <span className="text-xs font-bold text-[#f85149] font-mono mt-0.5">
            ${baselineCostPerPR.toFixed(3)}
          </span>
          <span className="text-[9px] text-[#6e7681]">per task</span>
        </div>

        {/* OmniGraph Studio */}
        <div className="p-2 rounded-lg bg-[#0d1117] border border-[#30363d] flex flex-col">
          <span className="text-[10px] text-[#8b949e] font-medium truncate">
            OmniGraph Studio
          </span>
          <span className="text-xs font-bold text-[#3fb950] font-mono mt-0.5">
            ${optimizedCostPerPR.toFixed(3)}
          </span>
          <span className="text-[9px] text-[#6e7681]">per task</span>
        </div>
      </div>

      {/* ── Interactive Monthly PR Volume Slider ── */}
      <div className="space-y-1.5 pt-2 border-t border-[#30363d]">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-[#8b949e]">Monthly PR Volume</span>
          <span className="text-[#58a6ff] font-bold">{monthlyPRs} PRs/mo</span>
        </div>
        <input
          type="range"
          min={10}
          max={1000}
          step={10}
          value={monthlyPRs}
          onChange={(e) => setMonthlyPRs(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-[#21262d] accent-[#3fb950]"
        />
        <div className="flex justify-between text-[9px] text-[#6e7681] font-mono">
          <span>10</span>
          <span>500</span>
          <span>1,000</span>
        </div>
      </div>

      {/* ── Dynamic Savings Footer ── */}
      <div className="pt-2 border-t border-[#30363d] grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="flex flex-col">
          <span className="text-[#8b949e] text-[10px]">Monthly Savings</span>
          <span className="text-sm font-bold text-[#3fb950]">
            ${monthlySavings.toFixed(2)}
          </span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[#8b949e] text-[10px]">Annual Savings</span>
          <span className="text-sm font-bold text-[#3fb950]">
            ${annualSavings.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
