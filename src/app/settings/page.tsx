'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Key, Cpu, ShieldCheck, Check, Wifi, WifiOff, Loader2, Trash2, Globe, Zap } from 'lucide-react';

type ConnectionStatus = 'idle' | 'testing' | 'connected' | 'failed';

export default function SettingsPage() {
  const [orcaKey, setOrcaKey] = useState('');
  const [orcaBaseUrl, setOrcaBaseUrl] = useState('https://api.orcarouter.ai/v1');
  const [orcaModel, setOrcaModel] = useState('openai/gpt-4o-mini');
  const [groqKey, setGroqKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [connectionLatency, setConnectionLatency] = useState<number | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Load keys from localStorage on mount
  useEffect(() => {
    const storedOrca = localStorage.getItem('omnigraph_orca_key');
    const storedOrcaUrl = localStorage.getItem('omnigraph_orca_url');
    const storedOrcaModel = localStorage.getItem('omnigraph_orca_model');
    const storedGroq = localStorage.getItem('omnigraph_groq_key');
    if (storedOrca) setOrcaKey(storedOrca);
    if (storedOrcaUrl) setOrcaBaseUrl(storedOrcaUrl);
    if (storedOrcaModel) setOrcaModel(storedOrcaModel);
    if (storedGroq) setGroqKey(storedGroq);
  }, []);

  const handleSave = () => {
    localStorage.setItem('omnigraph_orca_key', orcaKey);
    localStorage.setItem('omnigraph_orca_url', orcaBaseUrl);
    localStorage.setItem('omnigraph_orca_model', orcaModel);
    localStorage.setItem('omnigraph_groq_key', groqKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleClearKeys = () => {
    localStorage.removeItem('omnigraph_orca_key');
    localStorage.removeItem('omnigraph_orca_url');
    localStorage.removeItem('omnigraph_orca_model');
    localStorage.removeItem('omnigraph_groq_key');
    setOrcaKey('');
    setOrcaBaseUrl('https://api.orcarouter.ai/v1');
    setOrcaModel('openai/gpt-4o-mini');
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
          model: orcaModel,
          test: true,
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
            AI Model Keys & BYOK (Bring Your Own Key) Settings
          </h1>
          <span className="text-[10px] text-[#8b949e] hidden sm:inline shrink-0">Screen 13</span>
        </div>
      </div>

      {/* Settings Form Card */}
      <div className="p-4 sm:p-6 rounded-xl bg-[#161b22] border border-[#30363d] shadow-2xl max-w-2xl w-full space-y-4 sm:space-y-5 font-mono text-xs">
        <div className="space-y-1">
          <h2 className="text-xs sm:text-sm font-bold text-[#e6edf3]">BYOK LLM Provider Integration</h2>
          <p className="text-[11px] sm:text-xs text-[#8b949e] leading-relaxed">
            Keys are stored in your browser&apos;s localStorage and passed securely to <code className="bg-[#0d1117] px-1 rounded">/api/agents/psmas-run/</code>.
          </p>
        </div>

        <div className="space-y-3.5 pt-2">
          {/* OrcaRouter API Key */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8b949e] flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-[#58a6ff] shrink-0" />
              <span>OrcaRouter API Key (Gateway)</span>
            </label>
            <input
              type="password"
              placeholder="sk-orca-..."
              value={orcaKey}
              onChange={(e) => setOrcaKey(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-lg p-2.5 text-xs text-[#e6edf3] focus:outline-none transition-colors"
            />
          </div>

          {/* OrcaRouter Base URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8b949e] flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-[#58a6ff] shrink-0" />
              <span>OrcaRouter Base URL</span>
            </label>
            <input
              type="text"
              placeholder="https://api.orcarouter.ai/v1"
              value={orcaBaseUrl}
              onChange={(e) => setOrcaBaseUrl(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-lg p-2.5 text-xs text-[#e6edf3] focus:outline-none transition-colors"
            />
          </div>

          {/* OrcaRouter Model Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8b949e] flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-[#bc8cff] shrink-0" />
              <span>OrcaRouter Model</span>
            </label>
            <select
              value={orcaModel}
              onChange={(e) => setOrcaModel(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-lg p-2.5 text-xs text-[#e6edf3] focus:outline-none cursor-pointer"
            >
              <option value="openai/gpt-4o-mini">openai/gpt-4o-mini</option>
              <option value="openai/gpt-4o">openai/gpt-4o</option>
              <option value="google/gemini-2.5-flash">google/gemini-2.5-flash</option>
              <option value="deepseek/deepseek-chat">deepseek/deepseek-chat</option>
              <option value="auto">auto (OrcaRouter decides)</option>
            </select>
          </div>

          {/* Groq API Key */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8b949e] flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[#d29922] shrink-0" />
              <span>Groq API Key (Inference)</span>
            </label>
            <input
              type="password"
              placeholder="gsk_..."
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-lg p-2.5 text-xs text-[#e6edf3] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Connection Test Status */}
        {connectionStatus !== 'idle' && (
          <div className={`p-3 rounded-lg border text-xs font-mono ${
            connectionStatus === 'testing'
              ? 'bg-[#0d1117] border-[#58a6ff]/40 text-[#58a6ff]'
              : connectionStatus === 'connected'
              ? 'bg-[#16291e] border-[#238636] text-[#3fb950]'
              : 'bg-[#2d191e] border-[#f85149]/40 text-[#f85149]'
          }`}>
            <div className="flex items-center gap-2">
              {connectionStatus === 'testing' && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
              {connectionStatus === 'connected' && <Wifi className="w-3.5 h-3.5 shrink-0" />}
              {connectionStatus === 'failed' && <WifiOff className="w-3.5 h-3.5 shrink-0" />}
              <span className="font-bold truncate">
                {connectionStatus === 'testing' && 'Testing connection...'}
                {connectionStatus === 'connected' && `✓ Connected (${connectionLatency}ms)`}
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
            <span>Browser Storage Only</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleClearKeys}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-[#f85149] border border-[#30363d] font-medium transition-all text-xs min-h-[36px]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>

            <button
              onClick={handleTestConnection}
              disabled={!orcaKey || connectionStatus === 'testing'}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] border border-[#58a6ff]/40 font-medium transition-all text-xs disabled:opacity-40 disabled:cursor-not-allowed min-h-[36px]"
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>Test</span>
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
                <span>SAVE KEYS</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
