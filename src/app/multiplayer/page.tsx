'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Users, Wifi, Shield, Lock, Unlock, MousePointer, Radio, Send, Play, Pause } from 'lucide-react';
import { useOmniStore } from '@/lib/store/useOmniStore';

export default function MultiplayerPage() {
  const collaborators = useOmniStore(state => state.collaborators);
  const updateCollaboratorCursor = useOmniStore(state => state.updateCollaboratorCursor);
  const addLog = useOmniStore(state => state.addLog);
  const nodes = useOmniStore(state => state.nodes);

  const [isSimulating, setIsSimulating] = useState(false);
  const [lockedNodes, setLockedNodes] = useState<Record<string, string>>({}); // nodeId -> collaboratorId
  const [pingMessage, setPingMessage] = useState('');
  const [pingSent, setPingSent] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulated cursor movement
  useEffect(() => {
    if (isSimulating) {
      intervalRef.current = setInterval(() => {
        collaborators.forEach(c => {
          if (c.id !== 'collab-3') { // Don't move "You"
            const dx = (Math.random() - 0.5) * 40;
            const dy = (Math.random() - 0.5) * 40;
            updateCollaboratorCursor(
              c.id,
              Math.max(0, Math.min(800, c.cursor.x + dx)),
              Math.max(0, Math.min(600, c.cursor.y + dy)),
              c.activeNodeId || undefined,
            );
          }
        });
      }, 800);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isSimulating, collaborators, updateCollaboratorCursor]);

  const toggleNodeLock = (nodeId: string, collaboratorId: string) => {
    setLockedNodes(prev => {
      const next = { ...prev };
      if (next[nodeId] === collaboratorId) {
        delete next[nodeId];
      } else {
        next[nodeId] = collaboratorId;
      }
      return next;
    });
  };

  const sendSwarmPing = () => {
    if (!pingMessage.trim()) return;
    addLog({
      id: `ping-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      agentId: 'architect',
      agentName: 'Multiplayer Hub',
      phaseAngle: 0,
      level: 'info',
      message: `🔔 Swarm Ping: ${pingMessage}`,
    });
    setPingSent(true);
    setPingMessage('');
    setTimeout(() => setPingSent(false), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0d1117] text-[#e6edf3] p-4 font-sans select-none space-y-4 overflow-y-auto">
      {/* Subheader */}
      <div className="h-9 flex items-center justify-between px-3 bg-[#161b22] border border-[#30363d] rounded-xl font-mono text-xs shrink-0">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#a371f7]" />
          <h1 className="font-bold text-[#e6edf3]">Real-Time Multiplayer Collaborator Hub</h1>
          <span className="text-[10px] text-[#8b949e]">Screen 8</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Simulation Toggle */}
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
              isSimulating
                ? 'bg-[#d29922] text-[#0d1117] shadow-[0_0_10px_rgba(210,153,34,0.3)]'
                : 'bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d]'
            }`}
          >
            {isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isSimulating ? 'Stop Simulation' : 'Simulate Co-Presence'}</span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#16291e] border border-[#238636] text-[#3fb950] text-[11px] font-mono">
            <Wifi className={`w-3 h-3 text-[#3fb950] ${isSimulating ? 'animate-pulse' : ''}`} />
            <span>WebSocket Mesh Sync: &lt;15ms</span>
          </div>
        </div>
      </div>

      {/* Collaborators Active List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {collaborators.map((c) => (
          <div
            key={c.id}
            className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3 shadow-xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow"
                  style={{ backgroundColor: c.color }}
                >
                  {c.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#e6edf3]">{c.name}</h3>
                  <span className="text-xs text-[#8b949e] font-mono">{c.role}</span>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase border ${
                c.status === 'editing'
                  ? 'bg-[#16291e] border-[#238636] text-[#3fb950]'
                  : c.status === 'reviewing'
                  ? 'bg-[#58a6ff]/10 border-[#58a6ff]/30 text-[#58a6ff]'
                  : 'bg-[#0d1117] border-[#30363d] text-[#8b949e]'
              }`}>
                {c.status}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] text-xs font-mono text-[#8b949e] space-y-1">
              <div className="flex justify-between">
                <span>Active AST Focus:</span>
                <span className="text-[#58a6ff] font-semibold">{c.activeNodeId || 'Canvas Workspace'}</span>
              </div>
              <div className="flex justify-between">
                <span>Cursor Coordinate:</span>
                <span className="text-[#e6edf3]">({Math.round(c.cursor.x)}, {Math.round(c.cursor.y)})</span>
              </div>
            </div>

            {/* Node Lock Controls */}
            {c.activeNodeId && (
              <button
                onClick={() => toggleNodeLock(c.activeNodeId!, c.id)}
                className={`flex items-center gap-1.5 w-full px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  lockedNodes[c.activeNodeId] === c.id
                    ? 'bg-[#d29922]/10 text-[#d29922] border border-[#d29922]/40'
                    : 'bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] border border-[#30363d]'
                }`}
              >
                {lockedNodes[c.activeNodeId] === c.id ? (
                  <>
                    <Lock className="w-3 h-3" />
                    <span>Locked: {c.activeNodeId}</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3 h-3" />
                    <span>Lock Node: {c.activeNodeId}</span>
                  </>
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Swarm Ping Input */}
      <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3">
        <h2 className="text-xs font-bold uppercase text-[#8b949e] tracking-wider flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-[#a371f7]" />
          Swarm Ping — Broadcast to Agent Terminal
        </h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a message to broadcast to all agents..."
            value={pingMessage}
            onChange={(e) => setPingMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendSwarmPing()}
            className="flex-1 bg-[#0d1117] border border-[#30363d] focus:border-[#a371f7] rounded-lg px-3 py-2 text-xs font-mono text-[#e6edf3] placeholder-[#6e7681] focus:outline-none transition-colors"
          />
          <button
            onClick={sendSwarmPing}
            disabled={!pingMessage.trim()}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs transition-all ${
              pingSent
                ? 'bg-[#3fb950] text-[#0d1117]'
                : 'bg-[#a371f7] hover:bg-[#8b5cf6] text-white disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{pingSent ? 'Sent!' : 'Send Ping'}</span>
          </button>
        </div>
      </div>

      {/* Active Node Locks Display */}
      {Object.keys(lockedNodes).length > 0 && (
        <div className="p-4 rounded-xl bg-[#161b22] border border-[#d29922]/30 space-y-2">
          <h2 className="text-xs font-bold uppercase text-[#d29922] tracking-wider flex items-center gap-2">
            <Lock className="w-3.5 h-3.5" />
            Active Node Locks ({Object.keys(lockedNodes).length})
          </h2>
          <div className="space-y-1 text-xs font-mono">
            {Object.entries(lockedNodes).map(([nodeId, collabId]) => {
              const collab = collaborators.find(c => c.id === collabId);
              return (
                <div key={nodeId} className="flex items-center justify-between p-2 rounded-lg bg-[#0d1117] border border-[#30363d]">
                  <span className="text-[#d29922]">{nodeId}</span>
                  <span className="text-[#8b949e]">Locked by <span className="text-[#e6edf3] font-medium">{collab?.name || collabId}</span></span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
