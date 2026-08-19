/**
 * Beads Task Graph & External State Memory Engine (2026 Operational Architecture)
 * 
 * Inspired by Steve Yegge's Beads / Gas Town architecture.
 * Tasks are modeled as external hash-based nodes in a DAG rather than bloated LLM prompt context.
 */

export type BeadDependencyType = 'blocks' | 'related' | 'parent-child' | 'discovered-from';
export type BeadStatus = 'pending' | 'in_progress' | 'blocked' | 'completed' | 'failed';
export type OperationalRole = 'mayor' | 'polecat' | 'witness' | 'refinery';

export interface BeadTask {
  id: string; // Hash-based ID like 'bd-a1b2'
  title: string;
  description: string;
  status: BeadStatus;
  dependencyType: BeadDependencyType;
  dependencies: string[]; // IDs of blocking BeadTasks
  targetNodeId?: string; // Associated AST node in OmniGraph
  targetFile?: string;
  diffHunkId?: string;
  assignedRole: OperationalRole;
  tokenCost: number;
  createdAt: string;
  completedAt?: string;
  toolCallsExecuted: {
    tool: string;
    params: Record<string, any>;
    resultSummary: string;
    timestamp: string;
  }[];
  reflexionAttempts: number;
}

export interface BeadTaskGraph {
  beads: BeadTask[];
  activeExecutionQueue: string[];
  completedBeadIds: string[];
  totalMemoryTokensSaved: number;
}

export const INITIAL_BEAD_TASKS: BeadTask[] = [
  {
    id: 'bd-89f1',
    title: 'AST Call Graph Topology Discovery',
    description: 'Mayor scans root entry points and computes dependency traversal paths.',
    status: 'completed',
    dependencyType: 'parent-child',
    dependencies: [],
    targetNodeId: 'mod-auth',
    targetFile: 'src/router/auth.ts',
    assignedRole: 'mayor',
    tokenCost: 48,
    createdAt: new Date(Date.now() - 30000).toISOString(),
    completedAt: new Date(Date.now() - 25000).toISOString(),
    toolCallsExecuted: [
      {
        tool: 'inspect_ast_dag',
        params: { rootNode: 'mod-auth', depth: 3 },
        resultSummary: 'Discovered 4 module vertices, 8 function call sites, 0 cyclic imports.',
        timestamp: '12:00:01',
      },
    ],
    reflexionAttempts: 0,
  },
  {
    id: 'bd-42c8',
    title: 'Surgical JWT Claim Expiration Patch',
    description: 'Polecat-1 synthesizes minimal unified diff hunk for verifyJwtToken claims.',
    status: 'in_progress',
    dependencyType: 'blocks',
    dependencies: ['bd-89f1'],
    targetNodeId: 'fn-verifyjwt',
    targetFile: 'src/router/auth.ts',
    diffHunkId: 'hunk-001',
    assignedRole: 'polecat',
    tokenCost: 85,
    createdAt: new Date(Date.now() - 20000).toISOString(),
    toolCallsExecuted: [
      {
        tool: 'fetch_node_source',
        params: { nodeId: 'fn-verifyjwt' },
        resultSummary: 'Loaded AST snippet (lines 14-38, 240 bytes).',
        timestamp: '12:00:04',
      },
      {
        tool: 'synthesize_surgical_diff',
        params: { file: 'src/router/auth.ts', targetSymbol: 'verifyJwtToken' },
        resultSummary: 'Emitted Unified Hunk: @@ -14,5 +14,9 @@ with safe expiration check.',
        timestamp: '12:00:06',
      },
    ],
    reflexionAttempts: 0,
  },
  {
    id: 'bd-7e3a',
    title: 'SWE-bench Invariant Assertion Suite',
    description: 'Witness evaluates regression boundaries and checks edge-case expiration.',
    status: 'pending',
    dependencyType: 'blocks',
    dependencies: ['bd-42c8'],
    targetNodeId: 'assert-session-bleed',
    targetFile: 'test/auth.test.ts',
    assignedRole: 'witness',
    tokenCost: 52,
    createdAt: new Date(Date.now() - 15000).toISOString(),
    toolCallsExecuted: [],
    reflexionAttempts: 0,
  },
  {
    id: 'bd-91b4',
    title: 'Cryptographic Safe Barrier Reconcile',
    description: 'Refinery checks semantic conflicts and signs SHA-256 seal for IDE merge.',
    status: 'pending',
    dependencyType: 'parent-child',
    dependencies: ['bd-7e3a'],
    targetNodeId: 'mod-auth',
    targetFile: 'src/router/auth.ts',
    assignedRole: 'refinery',
    tokenCost: 35,
    createdAt: new Date(Date.now() - 10000).toISOString(),
    toolCallsExecuted: [],
    reflexionAttempts: 0,
  },
];

/**
 * Computes topological execution order of Bead tasks based on blocking dependencies.
 */
export function getSchedulableBeads(beads: BeadTask[]): BeadTask[] {
  const completedIds = new Set(
    beads.filter((b) => b.status === 'completed').map((b) => b.id)
  );

  return beads.filter((b) => {
    if (b.status !== 'pending') return false;
    return b.dependencies.every((depId) => completedIds.has(depId));
  });
}

/**
 * Creates dynamic Beads for an ingested repository AST graph.
 */
export function createDynamicBeadsForRepo(
  repoName: string,
  files: { path: string; name: string }[],
  objective: string
): BeadTask[] {
  const baseId = Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();

  const mayorBead: BeadTask = {
    id: `bd-${baseId}-01`,
    title: `[Mayor] Scan AST Call Graph & Topological Planner for ${repoName}`,
    description: `Construct dependency graph and task DAG for directive: "${objective}"`,
    status: 'completed',
    dependencyType: 'parent-child',
    dependencies: [],
    targetFile: files[0]?.path || 'src/index.ts',
    assignedRole: 'mayor',
    tokenCost: 65,
    createdAt: now,
    completedAt: now,
    toolCallsExecuted: [
      {
        tool: 'inspect_ast_dag',
        params: { repo: repoName, fileCount: files.length },
        resultSummary: `Discovered ${files.length} source files, built execution DAG.`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ],
    reflexionAttempts: 0,
  };

  const polecatBead: BeadTask = {
    id: `bd-${baseId}-02`,
    title: `[Polecat] Synthesize Surgical Patch for ${files[0]?.name || 'entry point'}`,
    description: `Generate zero-drift unified git diff hunk to address ${objective}`,
    status: 'in_progress',
    dependencyType: 'blocks',
    dependencies: [mayorBead.id],
    targetFile: files[0]?.path || 'src/index.ts',
    diffHunkId: `hunk-${baseId}`,
    assignedRole: 'polecat',
    tokenCost: 110,
    createdAt: now,
    toolCallsExecuted: [
      {
        tool: 'fetch_node_source',
        params: { path: files[0]?.path || 'src/index.ts' },
        resultSummary: 'Extracted active function AST block.',
        timestamp: new Date().toLocaleTimeString(),
      },
    ],
    reflexionAttempts: 0,
  };

  const witnessBead: BeadTask = {
    id: `bd-${baseId}-03`,
    title: `[Witness] Synthesize SWE-bench Invariant Regression Suite`,
    description: `Evaluate runtime assertions and invariant safety on modified AST nodes.`,
    status: 'pending',
    dependencyType: 'blocks',
    dependencies: [polecatBead.id],
    targetFile: files.find((f) => f.path.includes('test'))?.path || 'test/unit.test.ts',
    assignedRole: 'witness',
    tokenCost: 75,
    createdAt: now,
    toolCallsExecuted: [],
    reflexionAttempts: 0,
  };

  const refineryBead: BeadTask = {
    id: `bd-${baseId}-04`,
    title: `[Refinery] Safe Barrier Reconciler & Cryptographic SHA-256 Gate`,
    description: `Verify semantic patch integrity, seal cryptographic hash, and queue for Monaco IDE merge.`,
    status: 'pending',
    dependencyType: 'parent-child',
    dependencies: [witnessBead.id],
    targetFile: files[0]?.path || 'src/index.ts',
    assignedRole: 'refinery',
    tokenCost: 45,
    createdAt: now,
    toolCallsExecuted: [],
    reflexionAttempts: 0,
  };

  return [mayorBead, polecatBead, witnessBead, refineryBead];
}
