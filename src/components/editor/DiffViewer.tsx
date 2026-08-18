'use client';

import React, { useState, useMemo } from 'react';
import { FileDiff, AlertTriangle, Check, X, Scissors, FileCode, CheckCircle2, XCircle } from 'lucide-react';
import { useOmniStore } from '@/lib/store/useOmniStore';
import confetti from 'canvas-confetti';

export const DiffViewer: React.FC = () => {
  const diffHunks = useOmniStore(state => state.diffHunks);
  const acceptHunk = useOmniStore(state => state.acceptHunk);
  const rejectHunk = useOmniStore(state => state.rejectHunk);
  const acceptAllHunks = useOmniStore(state => state.acceptAllHunks);
  const rejectAllHunks = useOmniStore(state => state.rejectAllHunks);
  const applyApprovedPatches = useOmniStore(state => state.applyApprovedPatches);

  // File selector
  const uniqueFiles = useMemo(() => [...new Set(diffHunks.map(h => h.file))], [diffHunks]);
  const [selectedFile, setSelectedFile] = useState<string>('all');
  const [cherryPickId, setCherryPickId] = useState<string | null>(null);

  const visibleHunks = selectedFile === 'all'
    ? diffHunks
    : diffHunks.filter(h => h.file === selectedFile);

  const totalHunks = diffHunks.length;
  const acceptedCount = diffHunks.filter(h => h.status === 'accepted').length;
  const rejectedCount = diffHunks.filter(h => h.status === 'rejected').length;
  const pendingCount = diffHunks.filter(h => h.status === 'pending').length;
  const progressPct = totalHunks > 0 ? Math.round(((acceptedCount + rejectedCount) / totalHunks) * 100) : 0;

  const handleAccept = (hunkId: string) => {
    acceptHunk(hunkId);
    confetti({
      particleCount: 25,
      spread: 40,
      origin: { y: 0.8 },
      colors: ['#3fb950', '#58a6ff', '#bc8cff'],
    });
  };

  const handleReject = (hunkId: string) => {
    rejectHunk(hunkId);
  };

  const handleAcceptAll = () => {
    acceptAllHunks();
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3fb950', '#58a6ff', '#bc8cff', '#d29922'],
    });
  };

  const handleApplyPatches = () => {
    applyApprovedPatches();
    confetti({
      particleCount: 100,
      spread: 120,
      origin: { y: 0.5 },
      colors: ['#3fb950', '#58a6ff'],
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#161b22] text-[#e6edf3] font-sans overflow-hidden select-none">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#30363d]">
        <div className="flex items-center gap-2.5">
          <FileDiff className="w-4 h-4 text-[#e6edf3]" />
          <h2 className="text-sm font-semibold text-[#e6edf3] tracking-tight">
            Surgical Diff Picker
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* File Selector Dropdown */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0d1117] border border-[#30363d] text-xs font-mono">
            <FileCode className="w-3 h-3 text-[#58a6ff]" />
            <select
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              className="bg-transparent text-[#e6edf3] text-[11px] focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#161b22]">All Files ({totalHunks} hunks)</option>
              {uniqueFiles.map(f => (
                <option key={f} value={f} className="bg-[#161b22]">{f}</option>
              ))}
            </select>
          </div>

          {/* Human Review Required Pill */}
          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#2e2316] border border-[#9e6a03] text-[#d29922] text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-[#d29922]" />
              <span className="tracking-wide">{pendingCount} PENDING REVIEW</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Progress Bar ── */}
      <div className="px-5 pt-2 pb-1">
        <div className="flex items-center justify-between text-[10px] font-mono text-[#8b949e] mb-1">
          <span>Review Progress</span>
          <span>{progressPct}% ({acceptedCount} accepted, {rejectedCount} rejected, {pendingCount} pending)</span>
        </div>
        <div className="h-1.5 w-full bg-[#0d1117] rounded-full overflow-hidden border border-[#30363d]">
          <div className="h-full flex">
            <div
              className="bg-[#3fb950] transition-all duration-500"
              style={{ width: `${totalHunks > 0 ? (acceptedCount / totalHunks) * 100 : 0}%` }}
            />
            <div
              className="bg-[#f85149] transition-all duration-500"
              style={{ width: `${totalHunks > 0 ? (rejectedCount / totalHunks) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Main Scrollable Hunk List ── */}
      <div className="flex-1 px-5 py-2 overflow-y-auto space-y-3 font-mono text-xs">
        {visibleHunks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#6e7681] space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#3fb950]" />
            <p className="text-sm font-medium text-[#3fb950]">All hunks reviewed!</p>
            <p className="text-[11px]">Click &quot;Apply Approved Patches&quot; to commit changes to source code.</p>
          </div>
        ) : (
          visibleHunks.map((hunk, idx) => {
            const isCherryPick = cherryPickId === hunk.id;
            const deletions = hunk.lines.filter(l => l.type === 'deletion');
            const additions = hunk.lines.filter(l => l.type === 'addition');
            const contextLines = hunk.lines.filter(l => l.type === 'context');

            return (
              <div
                key={hunk.id}
                className={`rounded-lg border overflow-hidden transition-all ${
                  hunk.status === 'accepted'
                    ? 'border-[#238636] bg-[#0d1117] opacity-80'
                    : hunk.status === 'rejected'
                    ? 'border-[#f85149]/40 bg-[#0d1117] opacity-60'
                    : isCherryPick
                    ? 'border-[#d29922] bg-[#0d1117] shadow-[0_0_12px_rgba(210,153,34,0.2)]'
                    : 'border-[#30363d] bg-[#0d1117]'
                }`}
              >
                {/* Hunk Header */}
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#21262d] border-b border-[#30363d] text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#8b949e] font-medium">{hunk.file}</span>
                    <span className="text-[#6e7681]">Hunk {idx + 1}</span>
                    <span className="text-[#f85149] text-[10px]">−{deletions.length}</span>
                    <span className="text-[#3fb950] text-[10px]">+{additions.length}</span>
                    {hunk.status !== 'pending' && (
                      <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${
                        hunk.status === 'accepted'
                          ? 'bg-[#238636]/20 text-[#3fb950] border border-[#238636]/40'
                          : 'bg-[#f85149]/20 text-[#f85149] border border-[#f85149]/40'
                      }`}>
                        {hunk.status === 'accepted' ? '✓ Accepted' : '✗ Rejected'}
                      </span>
                    )}
                  </div>
                  <span className="text-[#6e7681] font-mono">{hunk.header}</span>
                </div>

                {/* Unified Diff Lines */}
                <div className="p-2.5 text-[11px] leading-relaxed space-y-0 select-text">
                  {hunk.lines.map((line, li) => {
                    const lineNo = line.type === 'deletion'
                      ? line.oldLineNo
                      : line.type === 'addition'
                      ? line.newLineNo
                      : line.oldLineNo || line.newLineNo;

                    return (
                      <div
                        key={li}
                        className={`flex gap-2 px-1 rounded-sm ${
                          line.type === 'deletion'
                            ? 'bg-[#3c1e22]/40 text-[#f85149]'
                            : line.type === 'addition'
                            ? 'bg-[#16291e]/50 text-[#3fb950]'
                            : 'text-[#8b949e]'
                        }`}
                      >
                        <span className="w-8 text-right select-none text-[#6e7681] shrink-0 font-mono">
                          {lineNo ?? ''}
                        </span>
                        <span className="w-3 text-center select-none shrink-0 font-bold">
                          {line.type === 'deletion' ? '−' : line.type === 'addition' ? '+' : ' '}
                        </span>
                        <span className="flex-1 whitespace-pre-wrap break-all">
                          {line.content || '\u00A0'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {hunk.explanation && (
                  <div className="px-3 py-1.5 bg-[#21262d]/50 border-t border-[#30363d] text-[10px] text-[#8b949e]">
                    💡 {hunk.explanation}
                  </div>
                )}

                {/* Hunk Action Buttons */}
                {hunk.status === 'pending' && (
                  <div className="flex items-center justify-end gap-2 px-3 py-2 bg-[#21262d] border-t border-[#30363d]">
                    <button
                      onClick={() => handleAccept(hunk.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1b3127] hover:bg-[#238636] text-[#3fb950] hover:text-white border border-[#238636] font-medium text-[11px] transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept</span>
                    </button>

                    <button
                      onClick={() => handleReject(hunk.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2d191e] hover:bg-[#da3633] text-[#f85149] hover:text-white border border-[#f85149]/60 font-medium text-[11px] transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={() => setCherryPickId(isCherryPick ? null : hunk.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium text-[11px] transition-all ${
                        isCherryPick
                          ? 'bg-[#d29922]/20 text-[#d29922] border-[#d29922] shadow-[0_0_8px_rgba(210,153,34,0.3)]'
                          : 'bg-[#21262d] hover:bg-[#30363d] border-[#30363d] text-[#e6edf3]'
                      }`}
                    >
                      <Scissors className="w-3 h-3" />
                      <span>{isCherryPick ? 'Focused' : 'Cherry-pick'}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Footer / Bulk Actions ── */}
      <div className="mt-auto px-5 py-3 border-t border-[#30363d] bg-[#161b22] flex items-center justify-between">
        <div className="text-xs font-mono">
          <span className="text-[#e6edf3] font-medium block">
            {totalHunks} Hunks · {acceptedCount} Accepted · {rejectedCount} Rejected
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAcceptAll}
            disabled={pendingCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1b3127] hover:bg-[#238636] text-[#3fb950] hover:text-white border border-[#238636] font-medium text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Accept All</span>
          </button>

          <button
            onClick={rejectAllHunks}
            disabled={pendingCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2d191e] hover:bg-[#da3633] text-[#f85149] hover:text-white border border-[#f85149]/60 font-medium text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Reject All</span>
          </button>

          {acceptedCount > 0 && (
            <button
              onClick={handleApplyPatches}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#58a6ff] hover:bg-[#79c0ff] text-[#0d1117] font-bold text-xs transition-all shadow-[0_0_12px_rgba(88,166,255,0.4)]"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Approved Patches</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
