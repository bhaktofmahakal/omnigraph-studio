'use client';

import React, { useState } from 'react';
import { useOmniStore } from '@/lib/store/useOmniStore';
import { generateCustomScenario } from '@/lib/graph/ogParser';
import {
  X,
  GitBranch,
  Code2,
  Cpu,
  Sparkles,
  Layers,
  CheckCircle2,
  FolderGit2,
  FileCode,
  Terminal,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export const RepoIngestModal: React.FC = () => {
  const isIngestModalOpen = useOmniStore((state) => state.isIngestModalOpen);
  const closeIngestModal = useOmniStore((state) => state.closeIngestModal);
  const addScenario = useOmniStore((state) => state.addScenario);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'github' | 'paste' | 'preset'>('github');
  const [repoName, setRepoName] = useState('My-Enterprise-Backend');
  const [repoUrl, setRepoUrl] = useState('https://github.com/my-org/core-service');
  const [language, setLanguage] = useState<'typescript' | 'python' | 'go' | 'rust' | 'java'>('typescript');
  const [issueDescription, setIssueDescription] = useState('Fix race condition in session state & add atomic mutex lock');
  const [customCode, setCustomCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isIngestModalOpen) return null;

  const handlePresetSelect = (
    name: string,
    lang: 'typescript' | 'python' | 'go' | 'rust' | 'java',
    desc: string
  ) => {
    setRepoName(name);
    setLanguage(lang);
    setIssueDescription(desc);
  };

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate real AST ingestion parsing
    await new Promise((r) => setTimeout(r, 600));

    const newScenario = generateCustomScenario({
      repoName: repoName.trim() || 'Custom-Project',
      repoUrl: repoUrl.trim(),
      language,
      issueDescription: issueDescription.trim() || 'Custom AST Optimization & Multi-Agent Patch',
      customCode: customCode.trim() || undefined,
    });

    addScenario(newScenario);
    setIsProcessing(false);
    setSuccessMessage(`Successfully ingested ${newScenario.title}! AST Graph generated.`);

    setTimeout(() => {
      setSuccessMessage('');
      closeIngestModal();
      router.push('/graph');
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0d1117] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] font-mono">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#30363d] bg-[#161b22]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#58a6ff]/10 text-[#58a6ff] border border-[#58a6ff]/20">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-[#e6edf3]">
                  Ingest Any Codebase / GitHub Repo
                </h2>
                <span className="text-[10px] bg-[#238636]/20 text-[#3fb950] px-1.5 py-0.5 rounded border border-[#238636]/30 font-semibold hidden xs:inline">
                  UNIVERSAL AST
                </span>
              </div>
              <p className="text-[11px] text-[#8b949e]">
                Parse any repository into typed ObjectGraph AST nodes for PSMAS Swarm.
              </p>
            </div>
          </div>

          <button
            onClick={closeIngestModal}
            className="p-1.5 rounded-lg text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#30363d] bg-[#0d1117] px-4 sm:px-6 gap-2">
          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-1.5 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'github'
                ? 'border-[#58a6ff] text-[#58a6ff]'
                : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>GitHub URL</span>
          </button>

          <button
            onClick={() => setActiveTab('preset')}
            className={`flex items-center gap-1.5 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'preset'
                ? 'border-[#58a6ff] text-[#58a6ff]'
                : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Stack Presets</span>
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`flex items-center gap-1.5 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'paste'
                ? 'border-[#58a6ff] text-[#58a6ff]'
                : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Paste Code</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleIngest} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {successMessage && (
            <div className="flex items-center gap-2 p-3 bg-[#16291e] border border-[#238636] text-[#3fb950] rounded-xl text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Preset Quick Select */}
          {activeTab === 'preset' && (
            <div className="space-y-2">
              <label className="text-[11px] text-[#8b949e] font-semibold">
                Select Common Architecture Pattern:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    name: 'FastAPI Microservice',
                    lang: 'python' as const,
                    desc: 'Async worker deadlock in Redis lock queue',
                  },
                  {
                    name: 'Go Distributed Service',
                    lang: 'go' as const,
                    desc: 'Goroutine channel leak during retry loop',
                  },
                  {
                    name: 'Rust Performance Engine',
                    lang: 'rust' as const,
                    desc: 'Atomic pointer race condition on buffer swap',
                  },
                  {
                    name: 'Java Spring Boot API',
                    lang: 'java' as const,
                    desc: 'Connection pool starvation in Hibernate tx',
                  },
                ].map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetSelect(p.name, p.lang, p.desc)}
                    className="p-2.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-left transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#e6edf3] group-hover:text-[#58a6ff]">
                        {p.name}
                      </span>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#0d1117] text-[#8b949e]">
                        {p.lang}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#8b949e] mt-1 line-clamp-1">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Repo Name & URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] text-[#8b949e] font-semibold flex items-center gap-1">
                <Code2 className="w-3 h-3 text-[#58a6ff]" /> Project / Repository Name
              </label>
              <input
                type="text"
                required
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="e.g. Acme-Core-API"
                className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-[#8b949e] font-semibold flex items-center gap-1">
                <Cpu className="w-3 h-3 text-[#3fb950]" /> Primary Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] cursor-pointer"
              >
                <option value="typescript">TypeScript / JavaScript</option>
                <option value="python">Python (Django / FastAPI / Flask)</option>
                <option value="go">Go (Golang Microservices)</option>
                <option value="rust">Rust (Systems / WebAssembly)</option>
                <option value="java">Java (Spring Boot / Maven)</option>
              </select>
            </div>
          </div>

          {activeTab === 'github' && (
            <div className="space-y-1.5">
              <label className="text-[11px] text-[#8b949e] font-semibold flex items-center gap-1">
                <GitBranch className="w-3.5 h-3.5 text-[#8b949e]" /> GitHub Repository Clone URL
              </label>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/organization/repo"
                className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff]"
              />
            </div>
          )}

          {/* Issue / Goal Description */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-[#8b949e] font-semibold flex items-center gap-1">
              <Terminal className="w-3 h-3 text-[#d29922]" /> Target Issue / Refactor Goal
            </label>
            <input
              type="text"
              required
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="e.g. Fix race condition, add JWT rotation, optimize SQL queries..."
              className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff]"
            />
          </div>

          {/* Raw Code Paste (if active) */}
          {activeTab === 'paste' && (
            <div className="space-y-1.5">
              <label className="text-[11px] text-[#8b949e] font-semibold">
                Paste Source Code (AST will parse classes & functions):
              </label>
              <textarea
                rows={5}
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder={`// Paste your source code here...\nclass CoreEngine {\n  processRequest() { ... }\n}`}
                className="w-full bg-[#161b22] border border-[#30363d] rounded-lg p-3 text-[#e6edf3] font-mono text-[11px] placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff] resize-none"
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#30363d] flex flex-col-reverse sm:flex-row items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeIngestModal}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-[#e6edf3] font-semibold transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white font-bold transition-all shadow-md hover:shadow-[0_0_15px_rgba(46,160,67,0.4)] disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isProcessing ? 'Parsing AST Topology...' : 'Ingest & Generate AST Graph'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
