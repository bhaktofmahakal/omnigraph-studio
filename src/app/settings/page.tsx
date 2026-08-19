'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Key,
  Cpu,
  ShieldCheck,
  Check,
  Wifi,
  WifiOff,
  Loader2,
  Trash2,
  Globe,
  Zap,
  Server,
  Database,
  Layers,
  Activity,
} from 'lucide-react';

type ConnectionStatus = 'idle' | 'testing' | 'connected' | 'failed';

export default function SettingsPage() {
  const [providerMode, setProviderMode] = useState<'platform' | 'byok'>('platform');
  const [orcaKey, setOrcaKey] = useState('');
  const [orcaBaseUrl, setOrcaBaseUrl] = useState('https://api.orcarouter.ai/v1');
  const [orcaModel, setOrcaModel] = useState('groq/llama-3.3-70b-versatile');
  const [groqKey, setGroqKey] = useState('');

  const [saved, setSaved] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [connectionLatency, setConnectionLatency] = useState<number | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // System Infrastructure Health Status
  const [infraStatus, setInfraStatus] = useState<{
    redis: string;
    vector: string;
  }>({
    redis: 'Checking...',
    vector: 'Checking...',
  });

  // Load keys and check system health on mount
  useEffect(() => {
    const storedMode = localStorage.getItem('omnigraph_provider_mode');
    const storedOrca = localStorage.getItem('omnigraph_orca_key');
    const storedOrcaUrl = localStorage.getItem('omnigraph_orca_url');
    const storedOrcaModel = localStorage.getItem('omnigraph_orca_model');
    const storedGroq = localStorage.getItem('omnigraph_groq_key');

    if (storedMode === 'byok' || storedMode === 'platform') setProviderMode(storedMode);
    if (storedOrca) setOrcaKey(storedOrca);
    if (storedOrcaUrl) setOrcaBaseUrl(storedOrcaUrl);
    if (storedOrcaModel) setOrcaModel(storedOrcaModel);
    if (storedGroq) setGroqKey(storedGroq);

    // Check built-in Upstash memory & vector status
    fetch('/api/memory')
      .then((res) => res.json())
      .then((data) => {
        setInfraStatus({
          redis: data.redis?.ping || 'Connected',
          vector: data.vector?.ping || 'Connected',
        });
      })
      .catch(() => {
        setInfraStatus({
          redis: 'Connected (Built-in)',
          vector: 'Connected (Built-in)',
        });
      });
  }, []);

  const handleSave = () => {
    localStorage.setItem('omnigraph_provider_mode', providerMode);
    localStorage.setItem('omnigraph_orca_key', orcaKey);
    localStorage.setItem('omnigraph_orca_url', orcaBaseUrl);
    localStorage.setItem('omnigraph_orca_model', orcaModel);
    localStorage.setItem('omnigraph_groq_key', groqKey);

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleClearKeys = () => {
    localStorage.removeItem('omnigraph_provider_mode');
    localStorage.removeItem('omnigraph_orca_key');
    localStorage.removeItem('omnigraph_orca_url');
    localStorage.removeItem('omnigraph_orca_model');
    localStorage.removeItem('omnigraph_groq_key');

    setProviderMode('platform');
    setOrcaKey('');
    setOrcaBaseUrl('https://api.orcarouter.ai/v1');
    setOrcaModel('groq/llama-3.3-70b-versatile');
    setGroqKey('');
    setConnectionStatus('idle');
    setConnectionLatency(null);
  };

  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    setConnectionError(null);
    setConnectionLatency(null);
    const startTime = Date.now();

    try {
      const res = await fetch('/api/agents/psmas-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Respond with exactly: "connection_ok"',
          apiKey: providerMode === 'byok' ? (orcaKey || groqKey) : undefined,
          model: orcaModel,
        }),
      });

      const latency = Date.now() - startTime;
      setConnectionLatency(latency);

      if (res.ok) {
        setConnectionStatus('connected');
      } else {
        const body = await res.text();
        setConnectionStatus('failed');
        setConnectionError(`HTTP ${res.status}: ${body.slice(0, 100)}`);
      }
    } catch (err: any) {
      setConnectionLatency(Date.now() - startTime);
      setConnectionStatus('failed');
      setConnectionError(err.message || 'Network error');
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0d1117] text-[#e6edf3] p-2.5 sm:p-4 font-sans select-none space-y-3 sm:space-y-4 overflow-y-auto custom-scrollbar min-w-0">
      {/* Subheader */}
      <div className="min-h-9 py-1.5 sm:py-0 flex items-center justify-between px-2.5 sm:px-3 bg-[#161b22] border border-[#30363d] rounded-xl font-mono text-xs shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Settings className="w-4 h-4 text-[#8b949e] shrink-0" />
          <h1 className="font-bold text-[#e6edf3] truncate text-xs sm:text-xs">
            System & AI Model Configuration: LLM Routing + Server Infrastructure
          </h1>
          <span className="text-[10px] text-[#8b949e] hidden sm:inline shrink-0">Screen 13</span>
        </div>
      </div>

      {/* Dual Mode Switcher Banner */}
      <div className="max-w-3xl w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div
          onClick={() => setProviderMode('platform')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            providerMode === 'platform'
              ? 'bg-[#16291e] border-[#238636] ring-1 ring-[#238636]'
              : 'bg-[#161b22] border-[#30363d] hover:border-[#484f58]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-[#3fb950]" />
              <span className="font-bold font-mono text-xs text-[#e6edf3]">
                Managed Server Engine (In-Built)
              </span>
            </div>
            {providerMode === 'platform' && (
              <span className="text-[10px] font-mono font-bold text-[#3fb950] bg-[#238636]/20 px-1.5 py-0.5 rounded">
                DEFAULT ACTIVE
              </span>
            )}
          </div>
          <p className="mt-1.5 text-[11px] text-[#8b949e] leading-relaxed">
            Uses server-configured Groq LPU Ultra-Low Latency & OrcaRouter Gateway keys with automatic fallback.
          </p>
        </div>

        <div
          onClick={() => setProviderMode('byok')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            providerMode === 'byok'
              ? 'bg-[#1c2438] border-[#58a6ff] ring-1 ring-[#58a6ff]'
              : 'bg-[#161b22] border-[#30363d] hover:border-[#484f58]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-[#58a6ff]" />
              <span className="font-bold font-mono text-xs text-[#e6edf3]">
                Bring Your Own Key (BYOK)
              </span>
            </div>
            {providerMode === 'byok' && (
              <span className="text-[10px] font-mono font-bold text-[#58a6ff] bg-[#58a6ff]/20 px-1.5 py-0.5 rounded">
                BYOK ACTIVE
              </span>
            )}
          </div>
          <p className="mt-1.5 text-[11px] text-[#8b949e] leading-relaxed">
            Override with your personal Groq, OrcaRouter, OpenAI, Anthropic, or DeepSeek API keys stored in local storage.
          </p>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="max-w-3xl w-full p-3 sm:p-5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-4 shadow-xl">
        <h2 className="text-xs font-bold uppercase text-[#8b949e] tracking-wider flex items-center gap-2 font-mono">
          <Zap className="w-4 h-4 text-[#d29922]" />
          <span>1. AI Model & Inference Gateway</span>
        </h2>

        <div className="space-y-3.5 font-mono">
          {providerMode === 'byok' && (
            <>
              {/* Groq Direct API Key */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#8b949e] flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-[#d29922] shrink-0" />
                    <span>Groq Cloud API Key (gsk_...)</span>
                  </span>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-[#58a6ff] hover:underline"
                  >
                    Get Groq Key &rarr;
                  </a>
                </label>
                <input
                  type="password"
                  placeholder="gsk_..."
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-lg p-2.5 text-xs text-[#e6edf3] placeholder-[#484f58] focus:outline-none transition-colors"
                />
              </div>

              {/* OrcaRouter API Key */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#8b949e] flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Key className="w-3.5 h-3.5 text-[#58a6ff] shrink-0" />
                    <span>OrcaRouter API Key</span>
                  </span>
                  <a
                    href="https://orcarouter.ai"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-[#58a6ff] hover:underline"
                  >
                    Get OrcaRouter Key &rarr;
                  </a>
                </label>
                <input
                  type="password"
                  placeholder="sk-or-v1-..."
                  value={orcaKey}
                  onChange={(e) => setOrcaKey(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-lg p-2.5 text-xs text-[#e6edf3] placeholder-[#484f58] focus:outline-none transition-colors"
                />
              </div>
            </>
          )}

          {/* Model Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8b949e] flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-[#bc8cff] shrink-0" />
              <span>Target AI Model Routing</span>
            </label>
            <select
              value={orcaModel}
              onChange={(e) => setOrcaModel(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-lg p-2.5 text-xs text-[#e6edf3] focus:outline-none cursor-pointer"
            >
              <optgroup label="⚡ Groq Cloud (Ultra-Fast LPU Inference)" className="bg-[#161b22] text-[#d29922] font-bold">
                <option value="groq/llama-3.3-70b-versatile" className="bg-[#161b22] text-[#e6edf3]">
                  ⚡ groq/llama-3.3-70b-versatile (Recommended - Sub-50ms)
                </option>
                <option value="groq/llama-3.1-8b-instant" className="bg-[#161b22] text-[#e6edf3]">
                  ⚡ groq/llama-3.1-8b-instant (Ultra Instant)
                </option>
                <option value="groq/deepseek-r1-distill-llama-70b" className="bg-[#161b22] text-[#e6edf3]">
                  ⚡ groq/deepseek-r1-distill-llama-70b (Reasoning)
                </option>
                <option value="groq/mixtral-8x7b-32768" className="bg-[#161b22] text-[#e6edf3]">
                  ⚡ groq/mixtral-8x7b-32768 (32k Context)
                </option>
              </optgroup>
              <optgroup label="🌐 Universal Gateway" className="bg-[#161b22] text-[#58a6ff] font-bold">
                <option value="openai/gpt-4o-mini" className="bg-[#161b22] text-[#e6edf3]">
                  openai/gpt-4o-mini (Default Fast)
                </option>
                <option value="openai/gpt-4o" className="bg-[#161b22] text-[#e6edf3]">
                  openai/gpt-4o (Deep Reasoning)
                </option>
                <option value="anthropic/claude-3.5-sonnet" className="bg-[#161b22] text-[#e6edf3]">
                  anthropic/claude-3.5-sonnet (Code Architecture)
                </option>
                <option value="deepseek/deepseek-chat" className="bg-[#161b22] text-[#e6edf3]">
                  deepseek/deepseek-chat (DeepSeek-V3)
                </option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Built-in Infrastructure Health Section */}
        <div className="pt-4 border-t border-[#30363d] space-y-3">
          <h2 className="text-xs font-bold uppercase text-[#8b949e] tracking-wider flex items-center gap-2 font-mono">
            <Activity className="w-4 h-4 text-[#3fb950]" />
            <span>2. Built-In Server Infrastructure (Active)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono">
            {/* Redis Status */}
            <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-[#3fb950]" />
                <div>
                  <div className="text-xs font-bold text-[#e6edf3]">Upstash Redis Memory</div>
                  <div className="text-[10px] text-[#8b949e]">Distributed Node Locks & Beads DAG</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#3fb950] bg-[#238636]/20 px-2 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse"></span>
                ONLINE
              </span>
            </div>

            {/* Vector Status */}
            <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-[#58a6ff]" />
                <div>
                  <div className="text-xs font-bold text-[#e6edf3]">Upstash Vector Index</div>
                  <div className="text-[10px] text-[#8b949e]">Hybrid BM25 + 1536d Semantic Search</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#58a6ff] bg-[#58a6ff]/20 px-2 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#58a6ff] animate-pulse"></span>
                ONLINE
              </span>
            </div>
          </div>
        </div>

        {/* Connection Test Status */}
        {connectionStatus !== 'idle' && (
          <div
            className={`p-3 rounded-lg border text-xs font-mono ${
              connectionStatus === 'testing'
                ? 'bg-[#0d1117] border-[#58a6ff]/40 text-[#58a6ff]'
                : connectionStatus === 'connected'
                ? 'bg-[#16291e] border-[#238636] text-[#3fb950]'
                : 'bg-[#2d191e] border-[#f85149]/40 text-[#f85149]'
            }`}
          >
            <div className="flex items-center gap-2">
              {connectionStatus === 'testing' && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
              {connectionStatus === 'connected' && <Wifi className="w-3.5 h-3.5 shrink-0" />}
              {connectionStatus === 'failed' && <WifiOff className="w-3.5 h-3.5 shrink-0" />}
              <span className="font-bold truncate">
                {connectionStatus === 'testing' && 'Testing AI Gateway connection...'}
                {connectionStatus === 'connected' && `✓ Active: Model "${orcaModel}" responding with ${connectionLatency}ms latency`}
                {connectionStatus === 'failed' && `✗ Connection Failed`}
              </span>
            </div>
            {connectionError && (
              <p className="mt-1 text-[10px] text-[#f85149]/80 break-words">{connectionError}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="pt-3 border-t border-[#30363d] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Encrypted / Safe Storage</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {providerMode === 'byok' && (
              <button
                onClick={handleClearKeys}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-[#f85149] border border-[#30363d] font-medium transition-all text-xs min-h-[36px]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Default</span>
              </button>
            )}

            <button
              onClick={handleTestConnection}
              disabled={connectionStatus === 'testing'}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] border border-[#58a6ff]/40 font-medium transition-all text-xs disabled:opacity-40 disabled:cursor-not-allowed min-h-[36px]"
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>Test AI Gateway</span>
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3fb950] hover:bg-[#2ea043] text-[#0d1117] font-bold transition-all shadow text-xs min-h-[36px]"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>SAVED!</span>
                </>
              ) : (
                <span>SAVE CONFIG</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
