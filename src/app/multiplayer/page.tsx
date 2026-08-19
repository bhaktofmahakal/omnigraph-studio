'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Wifi,
  Lock,
  Unlock,
  Radio,
  Send,
  Play,
  Pause,
  UserPlus,
  Trash2,
  Copy,
  Check,
  Edit2,
  X,
  Share2,
} from 'lucide-react';
import { useOmniStore } from '@/lib/store/useOmniStore';
import { Collaborator } from '@/lib/types';

export default function MultiplayerPage() {
  const collaborators = useOmniStore((state) => state.collaborators);
  const updateCollaboratorCursor = useOmniStore((state) => state.updateCollaboratorCursor);
  const addCollaborator = useOmniStore((state) => state.addCollaborator);
  const removeCollaborator = useOmniStore((state) => state.removeCollaborator);
  const updateUserProfile = useOmniStore((state) => state.updateUserProfile);
  const addLog = useOmniStore((state) => state.addLog);
  const nodes = useOmniStore((state) => state.nodes);

  const [isSimulating, setIsSimulating] = useState(false);
  const [lockedNodes, setLockedNodes] = useState<Record<string, string>>({}); // nodeId -> collaboratorId
  const [pingMessage, setPingMessage] = useState('');
  const [pingSent, setPingSent] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // New collaborator form state
  const [newCollabName, setNewCollabName] = useState('');
  const [newCollabRole, setNewCollabRole] = useState('Frontend Engineer');
  const [newCollabColor, setNewCollabColor] = useState('#818CF8');

  // User profile state
  const currentUser = collaborators.find((c) => c.id === 'collab-3') || collaborators[collaborators.length - 1];
  const [profileName, setProfileName] = useState(currentUser?.name || 'You (Lead Engineer)');
  const [profileRole, setProfileRole] = useState(currentUser?.role || 'Lead AI Engineer');

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulated cursor movement across active AST nodes
  useEffect(() => {
    if (isSimulating) {
      intervalRef.current = setInterval(() => {
        collaborators.forEach((c) => {
          if (c.id !== 'collab-3') {
            // Don't move "You"
            const dx = (Math.random() - 0.5) * 40;
            const dy = (Math.random() - 0.5) * 40;
            const randomNode = nodes.length > 0 ? nodes[Math.floor(Math.random() * nodes.length)]?.id : undefined;

            updateCollaboratorCursor(
              c.id,
              Math.max(0, Math.min(800, c.cursor.x + dx)),
              Math.max(0, Math.min(600, c.cursor.y + dy)),
              randomNode || c.activeNodeId || undefined
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
  }, [isSimulating, collaborators, nodes, updateCollaboratorCursor]);

  const toggleNodeLock = async (nodeId: string, collaboratorId: string) => {
    const isCurrentlyLocked = lockedNodes[nodeId] === collaboratorId;

    if (isCurrentlyLocked) {
      await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'release_lock', nodeId, holderId: collaboratorId }),
      }).catch(() => {});

      setLockedNodes((prev) => {
        const next = { ...prev };
        delete next[nodeId];
        return next;
      });
    } else {
      const res = await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'acquire_lock', nodeId, holderId: collaboratorId, ttlSec: 60 }),
      }).catch(() => null);

      if (res && res.ok) {
        setLockedNodes((prev) => ({ ...prev, [nodeId]: collaboratorId }));
      } else {
        setLockedNodes((prev) => ({ ...prev, [nodeId]: collaboratorId }));
      }
    }
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
      message: `🔔 Swarm Ping from ${currentUser?.name || 'User'}: ${pingMessage}`,
    });
    setPingSent(true);
    setPingMessage('');
    setTimeout(() => setPingSent(false), 2000);
  };

  const handleCopyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/multiplayer?room=mesh-${Math.floor(1000 + Math.random() * 9000)}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCreateCollaborator = () => {
    if (!newCollabName.trim()) return;
    const initials = newCollabName
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const newCollab: Collaborator = {
      id: `collab-${Date.now()}`,
      name: newCollabName.trim(),
      role: newCollabRole.trim(),
      color: newCollabColor,
      avatar: initials || 'DEV',
      cursor: { x: Math.floor(200 + Math.random() * 400), y: Math.floor(150 + Math.random() * 300) },
      activeNodeId: nodes[0]?.id || 'Canvas',
      status: 'online',
    };

    addCollaborator(newCollab);
    setNewCollabName('');
    setIsAddModalOpen(false);
  };

  const handleSaveProfile = () => {
    updateUserProfile(profileName, profileRole);
    setIsProfileModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0d1117] text-[#e6edf3] p-2.5 sm:p-4 font-sans select-none space-y-3 sm:space-y-4 overflow-y-auto custom-scrollbar min-w-0">
      {/* Subheader */}
      <div className="min-h-9 py-1.5 sm:py-0 flex flex-wrap items-center justify-between px-2.5 sm:px-3 bg-[#161b22] border border-[#30363d] rounded-xl font-mono text-xs shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Users className="w-4 h-4 text-[#a371f7] shrink-0" />
          <h1 className="font-bold text-[#e6edf3] truncate text-xs sm:text-xs">
            Multiplayer Room Session (#mesh-8921)
          </h1>
          <span className="text-[10px] text-[#8b949e] hidden sm:inline shrink-0">Screen 8</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Copy Invite Link */}
          <button
            onClick={handleCopyInviteLink}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] hover:text-[#79c0ff] border border-[#58a6ff]/30 text-xs font-mono transition-all"
            title="Copy invite link to share with teammates"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-[#3fb950]" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Invite Teammate'}</span>
          </button>

          {/* Add Collaborator Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#238636]/20 hover:bg-[#238636]/30 text-[#3fb950] border border-[#238636]/40 text-xs font-mono transition-all font-semibold"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Member</span>
          </button>

          {/* Simulation Toggle */}
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all min-h-[32px] ${
              isSimulating
                ? 'bg-[#d29922] text-[#0d1117] shadow-[0_0_10px_rgba(210,153,34,0.3)]'
                : 'bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d]'
            }`}
          >
            {isSimulating ? <Pause className="w-3 h-3 shrink-0" /> : <Play className="w-3 h-3 shrink-0" />}
            <span className="hidden xs:inline">{isSimulating ? 'Stop Sim' : 'Simulate Co-Presence'}</span>
            <span className="xs:hidden">{isSimulating ? 'Stop' : 'Sim'}</span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#16291e] border border-[#238636] text-[#3fb950] text-[11px] font-mono shrink-0">
            <Wifi className={`w-3 h-3 text-[#3fb950] ${isSimulating ? 'animate-pulse' : ''}`} />
            <span>&lt;15ms Mesh</span>
          </div>
        </div>
      </div>

      {/* Collaborators Active Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {collaborators.map((c) => {
          const isYou = c.id === 'collab-3';
          const activeNodeLabel = nodes.find((n) => n.id === c.activeNodeId)?.label || c.activeNodeId || 'Graph Canvas';

          return (
            <div
              key={c.id}
              className={`p-4 sm:p-5 rounded-xl bg-[#161b22] border transition-all space-y-3 shadow-xl relative overflow-hidden ${
                isYou ? 'border-[#388bfd]/50 ring-1 ring-[#388bfd]/30' : 'border-[#30363d]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-white shadow shrink-0 text-xs sm:text-sm"
                    style={{ backgroundColor: c.color }}
                  >
                    {c.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-xs sm:text-sm text-[#e6edf3] truncate">{c.name}</h3>
                      {isYou && (
                        <button
                          onClick={() => setIsProfileModalOpen(true)}
                          className="p-1 hover:bg-[#21262d] rounded text-[#8b949e] hover:text-[#58a6ff] transition-colors"
                          title="Edit your profile"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <span className="text-[11px] text-[#8b949e] font-mono block truncate">{c.role}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono uppercase border shrink-0 ${
                      c.status === 'editing'
                        ? 'bg-[#16291e] border-[#238636] text-[#3fb950]'
                        : c.status === 'reviewing'
                        ? 'bg-[#58a6ff]/10 border-[#58a6ff]/30 text-[#58a6ff]'
                        : 'bg-[#0d1117] border-[#30363d] text-[#8b949e]'
                    }`}
                  >
                    {c.status}
                  </span>

                  {!isYou && (
                    <button
                      onClick={() => removeCollaborator(c.id)}
                      className="p-1 rounded hover:bg-[#2d191e] text-[#8b949e] hover:text-[#f85149] transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-2.5 sm:p-3 rounded-lg bg-[#0d1117] border border-[#30363d] text-xs font-mono text-[#8b949e] space-y-1">
                <div className="flex justify-between items-center gap-2">
                  <span className="shrink-0 text-[11px]">Active Focus:</span>
                  <span className="text-[#58a6ff] font-semibold truncate text-[11px]">{activeNodeLabel}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="shrink-0 text-[11px]">Cursor:</span>
                  <span className="text-[#e6edf3] text-[11px]">
                    ({Math.round(c.cursor.x)}, {Math.round(c.cursor.y)})
                  </span>
                </div>
              </div>

              {/* Node Lock Controls */}
              <button
                onClick={() => toggleNodeLock(c.activeNodeId || 'node-active', c.id)}
                className={`flex items-center justify-center gap-1.5 w-full px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all min-h-[32px] ${
                  lockedNodes[c.activeNodeId || 'node-active'] === c.id
                    ? 'bg-[#d29922]/10 text-[#d29922] border border-[#d29922]/40'
                    : 'bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] border border-[#30363d]'
                }`}
              >
                {lockedNodes[c.activeNodeId || 'node-active'] === c.id ? (
                  <>
                    <Lock className="w-3 h-3 text-[#d29922]" />
                    <span className="truncate">Locked: {activeNodeLabel}</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3 h-3" />
                    <span className="truncate">Lock: {activeNodeLabel}</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Swarm Ping Input */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3 shadow-xl">
        <h2 className="text-xs font-bold uppercase text-[#8b949e] tracking-wider flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-[#a371f7]" />
          Swarm Ping — Broadcast Message to Live Agent Terminal
        </h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a team broadcast message (e.g. 'Reviewing auth.ts refactor before PR merge')..."
            value={pingMessage}
            onChange={(e) => setPingMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendSwarmPing()}
            className="flex-1 bg-[#0d1117] border border-[#30363d] focus:border-[#a371f7] rounded-lg px-3 py-2 text-xs font-mono text-[#e6edf3] placeholder-[#6e7681] focus:outline-none transition-colors min-w-0"
          />
          <button
            onClick={sendSwarmPing}
            disabled={!pingMessage.trim()}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-lg font-bold text-xs transition-all shrink-0 min-h-[36px] ${
              pingSent
                ? 'bg-[#3fb950] text-[#0d1117]'
                : 'bg-[#a371f7] hover:bg-[#8b5cf6] text-white disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{pingSent ? 'Broadcasted!' : 'Send'}</span>
          </button>
        </div>
      </div>

      {/* Active Node Locks Display */}
      {Object.keys(lockedNodes).length > 0 && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#161b22] border border-[#d29922]/30 space-y-2 shadow-xl">
          <h2 className="text-xs font-bold uppercase text-[#d29922] tracking-wider flex items-center gap-2">
            <Lock className="w-3.5 h-3.5" />
            Active Node Locks ({Object.keys(lockedNodes).length})
          </h2>
          <div className="space-y-1.5 text-xs font-mono">
            {Object.entries(lockedNodes).map(([nodeId, collabId]) => {
              const collab = collaborators.find((c) => c.id === collabId);
              return (
                <div
                  key={nodeId}
                  className="flex flex-wrap items-center justify-between p-2 rounded-lg bg-[#0d1117] border border-[#30363d] gap-1"
                >
                  <span className="text-[#d29922] font-semibold">{nodeId}</span>
                  <span className="text-[#8b949e]">
                    Locked by <span className="text-[#e6edf3] font-medium">{collab?.name || collabId}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
              <h3 className="font-bold text-sm text-[#e6edf3] flex items-center gap-2 font-mono">
                <UserPlus className="w-4 h-4 text-[#3fb950]" />
                Add Team Collaborator
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded hover:bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-[#8b949e]">Teammate Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Jordan Miller"
                  value={newCollabName}
                  onChange={(e) => setNewCollabName(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-lg p-2 text-[#e6edf3] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#8b949e]">Role:</label>
                <input
                  type="text"
                  placeholder="e.g. Backend Lead / QA Architect"
                  value={newCollabRole}
                  onChange={(e) => setNewCollabRole(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-lg p-2 text-[#e6edf3] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#8b949e]">Avatar Color:</label>
                <div className="flex gap-2 pt-1">
                  {['#818CF8', '#34D399', '#F472B6', '#FBBF24', '#38BDF8', '#A78BFA'].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewCollabColor(col)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        newCollabColor === col ? 'scale-125 ring-2 ring-white' : ''
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#30363d]">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3] text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCollaborator}
                disabled={!newCollabName.trim()}
                className="px-4 py-1.5 rounded-lg bg-[#3fb950] hover:bg-[#2ea043] text-[#0d1117] font-bold text-xs font-mono disabled:opacity-40"
              >
                Add Collaborator
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
              <h3 className="font-bold text-sm text-[#e6edf3] flex items-center gap-2 font-mono">
                <Edit2 className="w-4 h-4 text-[#58a6ff]" />
                Edit Your Profile
              </h3>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1 rounded hover:bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-[#8b949e]">Your Display Name:</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-lg p-2 text-[#e6edf3] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#8b949e]">Your Role:</label>
                <input
                  type="text"
                  value={profileRole}
                  onChange={(e) => setProfileRole(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-lg p-2 text-[#e6edf3] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#30363d]">
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3] text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-1.5 rounded-lg bg-[#58a6ff] hover:bg-[#79c0ff] text-[#0d1117] font-bold text-xs font-mono"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
