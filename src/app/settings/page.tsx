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
  Network,
} from 'lucide-react';

type ConnectionStatus = 'idle' | 'testing' | 'connected' | 'failed';

export default function SettingsPage() {
  const [providerMode, setProviderMode] = useState<'platform' | 'byok'>('platform');
  const [orcaKey, setOrcaKey] = useState('');
  const [orcaBaseUrl, setOrcaBaseUrl] = useState('https://api.orcarouter.ai/v1');
  const [orcaModel, setOrcaModel] = useState('groq/llama-3.3-70b-versatile');
  const [groqKey, setGroqKey] = useState('');

  // Upstash Memory Layer States
  const [upstashRedisUrl, setUpstashRedisUrl] = useState('');
  const [upstashRedisToken, setUpstashRedisToken] = useState('');
  const [upstashVectorUrl, setUpstashVectorUrl] = useState('');
  const [upstashVectorToken, setUpstashVectorToken] = useState('');
  const [memoryPingStatus, setMemoryPingStatus] = useState<string | null>(null);
  const [isTestingMemory, setIsTestingMemory] = useState(false);

  const [saved, setSaved] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [connectionLatency, setConnectionLatency] = useState<number | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Load keys and mode from localStorage on mount
  useEffect(() => {
    const storedMode = localStorage.getItem('omnigraph_provider_mode');
    const storedOrca = localStorage.getItem('omnigraph_orca_key');
    const storedOrcaUrl = localStorage.getItem('omnigraph_orca_url');
    const storedOrcaModel = localStorage.getItem('omnigraph_orca_model');
    const storedGroq = localStorage.getItem('omnigraph_groq_key');

    const storedRedisUrl = localStorage.getItem('omnigraph_upstash_redis_url');
    const storedRedisToken = localStorage.getItem('omnigraph_upstash_redis_token');
    const storedVectorUrl = localStorage.getItem('omnigraph_upstash_vector_url');
    const storedVectorToken = localStorage.getItem('omnigraph_upstash_vector_token');

    if (storedMode === 'byok' || storedMode === 'platform') setProviderMode(storedMode);
    if (storedOrca) setOrcaKey(storedOrca);
    if (storedOrcaUrl) setOrcaBaseUrl(storedOrcaUrl);
    if (storedOrcaModel) setOrcaModel(storedOrcaModel);
    if (storedGroq) setGroqKey(storedGroq);

    if (storedRedisUrl) setUpstashRedisUrl(storedRedisUrl);
    if (storedRedisToken) setUpstashRedisToken(storedRedisToken);
    if (storedVectorUrl) setUpstashVectorUrl(storedVectorUrl);
    if (storedVectorToken) setUpstashVectorToken(storedVectorToken);
  }, []);

  const handleSave = () => {
    localStorage.setItem('omnigraph_provider_mode', providerMode);
    localStorage.setItem('omnigraph_orca_key', orcaKey);
    localStorage.setItem('omnigraph_orca_url', orcaBaseUrl);
    localStorage.setItem('omnigraph_orca_model', orcaModel);
    localStorage.setItem('omnigraph_groq_key', groqKey);

    localStorage.setItem('omnigraph_upstash_redis_url', upstashRedisUrl);
    localStorage.setItem('omnigraph_upstash_redis_token', upstashRedisToken);
    localStorage.setItem('omnigraph_upstash_vector_url', upstashVectorUrl);
    localStorage.setItem('omnigraph_upstash_vector_token', upstashVectorToken);

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleClearKeys = () => {
    localStorage.removeItem('omnigraph_provider_mode');
    localStorage.removeItem('omnigraph_orca_key');
    localStorage.removeItem('omnigraph_orca_url');
    localStorage.removeItem('omnigraph_orca_model');
    localStorage.removeItem('omnigraph_groq_key');

    localStorage.removeItem('omnigraph_upstash_redis_url');
    localStorage.removeItem('omnigraph_upstash_redis_token');
    localStorage.removeItem('omnigraph_upstash_vector_url');
    localStorage.removeItem('omnigraph_upstash_vector_token');

    setProviderMode('platform');
    setOrcaKey('');
    setOrcaBaseUrl('https://api.orcarouter.ai/v1');
    setOrcaModel('groq/llama-3.3-70b-versatile');
    setGroqKey('');
    setUpstashRedisUrl('');
    setUpstashRedisToken('');
    setUpstashVectorUrl('');
    setUpstashVectorToken('');
    setConnectionStatus('idle');
    setConnectionLatency(null);
    setMemoryPingStatus(null);
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

  const handleTestUpstashMemory = async () => {
    setIsTestingMemory(true);
    setMemoryPingStatus('Pinging Upstash endpoints...');

    try {
      const queryParams = new URLSearchParams();
      if (upstashRedisUrl) queryParams.set('redisUrl', upstashRedisUrl);
      if (upstashRedisToken) queryParams.set('redisToken', upstashRedisToken);
      if (upstashVectorUrl) queryParams.set('vectorUrl', upstashVectorUrl);
      if (upstashVectorToken) queryParams.set('vectorToken', upstashVectorToken);

      const res = await fetch(`/api/memory?${queryParams.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setMemoryPingStatus(
          `Redis: ${data.redis?.ping} | Vector: ${data.vector?.ping}`
        );
      } else {
        setMemoryPingStatus(`Memory check failed: ${data.error}`);
      }
    } catch (err: any) {
      setMemoryPingStatus(`Network error: ${err.message}`);
    } finally {
      setIsTestingMemory(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0d1117] text-[#e6edf3] p-2.5 sm:p-4 font-sans select-none space-y-3 sm:space-y-4 overflow-y-auto custom-scrollbar min-w-0">
      {/* Subheader */}
      <div className="min-h-9 py-1.5 sm:py-0 flex items-center justify-between px-2.5 sm:px-3 bg-[#161b22] border border-[#30363d] rounded-xl font-mono text-xs shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Settings className="w-4 h-4 text-[#8b949e] shrink-0" />
          <h1 className="font-bold text-[#e6edf3] truncate text-xs sm:text-xs">
            System & Memory Architecture Configuration: LLM Gateway + Upstash Layer
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

        {/* Upstash Memory Layer Card */}
        <div className="pt-4 border-t border-[#30363d] space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase text-[#8b949e] tracking-wider flex items-center gap-2 font-mono">
              <Database className="w-4 h-4 text-[#3fb950]" />
              <span>2. Upstash Serverless Memory & Vector Layer</span>
            </h2>
            <a
              href="https://console.upstash.com"
              target="_blank"
              rel="noreferrer"
              className="text-[10px] font-mono text-[#3fb950] hover:underline"
            >
              Open Upstash Console &rarr;
            </a>
          </div>

          <p className="text-[11px] text-[#8b949e] leading-relaxed font-mono">
            Powers distributed AST node locks in <code>/multiplayer</code>, persistent Beads task DAGs in <code>/psmas</code>, and semantic code search via Upstash Vector.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
            {/* Redis REST URL */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#8b949e]">Upstash Redis REST URL</label>
              <input
                type="text"
                placeholder="https://...upstash.io"
                value={upstashRedisUrl}
                onChange={(e) => setUpstashRedisUrl(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#3fb950] rounded-lg p-2 text-xs text-[#e6edf3] placeholder-[#484f58] focus:outline-none transition-colors"
              />
            </div>

            {/* Redis REST Token */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#8b949e]">Upstash Redis REST Token</label>
              <input
                type="password"
                placeholder="AX...=="
                value={upstashRedisToken}
                onChange={(e) => setUpstashRedisToken(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#3fb950] rounded-lg p-2 text-xs text-[#e6edf3] placeholder-[#484f58] focus:outline-none transition-colors"
              />
            </div>

            {/* Vector REST URL */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#8b949e]">Upstash Vector REST URL</label>
              <input
                type="text"
                placeholder="https://...vector.upstash.io"
                value={upstashVectorUrl}
                onChange={(e) => setUpstashVectorUrl(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#3fb950] rounded-lg p-2 text-xs text-[#e6edf3] placeholder-[#484f58] focus:outline-none transition-colors"
              />
            </div>

            {/* Vector REST Token */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#8b949e]">Upstash Vector REST Token</label>
              <input
                type="password"
                placeholder="AB...=="
                value={upstashVectorToken}
                onChange={(e) => setUpstashVectorToken(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#3fb950] rounded-lg p-2 text-xs text-[#e6edf3] placeholder-[#484f58] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Upstash Memory Ping Output */}
          {memoryPingStatus && (
            <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d] font-mono text-[11px] text-[#3fb950] flex items-center justify-between">
              <span>{memoryPingStatus}</span>
              <span className="text-[9px] text-[#8b949e]">Checked at {new Date().toLocaleTimeString()}</span>
            </div>
          )}
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
            <button
              onClick={handleTestUpstashMemory}
              disabled={isTestingMemory}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-[#3fb950] border border-[#3fb950]/40 font-medium transition-all text-xs disabled:opacity-40 disabled:cursor-not-allowed min-h-[36px]"
            >
              {isTestingMemory ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
              <span>Test Upstash Memory</span>
            </button>

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
