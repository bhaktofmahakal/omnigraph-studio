import { OGNodeData, OGEdgeData, ASTSignature } from '../types';

export interface GraphDisclosureState {
  nodes: OGNodeData[];
  edges: OGEdgeData[];
  totalRawTokens: number;
  totalCompressedTokens: number;
  tokensSaved: number;
  savingsPercentage: number;
}

export function calculateGraphTokenMetrics(nodes: OGNodeData[]): {
  totalRawTokens: number;
  totalCompressedTokens: number;
  tokensSaved: number;
  savingsPercentage: number;
} {
  let totalRawTokens = 0;
  let totalCompressedTokens = 0;

  for (const node of nodes) {
    totalRawTokens += node.tokenCount;
    // If the node is loaded/disclosed in context, use its compressed AST representation
    totalCompressedTokens += node.isLoaded ? node.compressedTokens : Math.min(25, Math.round(node.compressedTokens * 0.2));
  }

  const tokensSaved = Math.max(0, totalRawTokens - totalCompressedTokens);
  const savingsPercentage = totalRawTokens > 0 ? Number(((tokensSaved / totalRawTokens) * 100).toFixed(1)) : 0;

  return {
    totalRawTokens,
    totalCompressedTokens,
    tokensSaved,
    savingsPercentage,
  };
}

export function expandNodeProgressive(
  nodeId: string,
  currentNodes: OGNodeData[],
  currentEdges: OGEdgeData[]
): {
  updatedNodes: OGNodeData[];
  updatedEdges: OGEdgeData[];
  newNodeCount: number;
} {
  const targetNode = currentNodes.find(n => n.id === nodeId);
  if (!targetNode) {
    return { updatedNodes: currentNodes, updatedEdges: currentEdges, newNodeCount: 0 };
  }

  // Toggle expansion state
  const isNowExpanded = !targetNode.isExpanded;
  
  const updatedNodes = currentNodes.map(node => {
    if (node.id === nodeId) {
      return {
        ...node,
        isExpanded: isNowExpanded,
        isLoaded: true,
        status: (isNowExpanded ? 'traversed' : 'idle') as any,
      };
    }
    // If this node is a child of the clicked node, reveal or hide
    if (node.parentId === nodeId) {
      return {
        ...node,
        isLoaded: isNowExpanded,
        status: (isNowExpanded ? 'traversed' : 'idle') as any,
      };
    }
    return node;
  });

  return {
    updatedNodes,
    updatedEdges: currentEdges,
    newNodeCount: isNowExpanded ? (targetNode.childrenIds?.length || 0) : 0,
  };
}

export function searchNodes(query: string, nodes: OGNodeData[]): OGNodeData[] {
  if (!query.trim()) return nodes;
  const q = query.toLowerCase();
  return nodes.filter(
    n =>
      n.label.toLowerCase().includes(q) ||
      n.path.toLowerCase().includes(q) ||
      n.exportSymbols?.some(s => s.toLowerCase().includes(q)) ||
      n.signatures.some(sig => sig.name.toLowerCase().includes(q))
  );
}

export function generateCustomScenario(params: {
  repoName: string;
  repoUrl?: string;
  language: string;
  issueDescription: string;
  customCode?: string;
}) {
  const cleanName = params.repoName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase() || 'custom-repo';
  const id = `custom-${cleanName}-${Date.now()}`;
  const lang = params.language.toLowerCase();
  const ext = lang === 'python' ? 'py' : lang === 'go' ? 'go' : lang === 'rust' ? 'rs' : lang === 'java' ? 'java' : 'ts';

  const defaultInitialCode = params.customCode || (lang === 'python' ? `"""
${params.repoName} - Universal AST Module
Issue: ${params.issueDescription}
"""

class CoreEngine:
    def __init__(self, config=None):
        self.config = config or {}
        self.is_initialized = False

    def process_request(self, payload: dict) -> dict:
        # BUG: Race condition on un-isolated session state
        if not self.is_initialized:
            self.initialize()
        return {"status": "success", "data": payload}

    def initialize(self):
        self.is_initialized = True
` : `/**
 * ${params.repoName} - Universal AST Module
 * Issue: ${params.issueDescription}
 */

export interface EngineConfig {
  retries: number;
  timeoutMs: number;
  enableSafetyChecks: boolean;
}

export class CoreEngine {
  private isInitialized = false;

  constructor(private config: EngineConfig) {}

  public async processRequest(payload: Record<string, unknown>): Promise<{ status: string }> {
    // BUG: Missing atomic mutex lock during concurrent requests
    if (!this.isInitialized) {
      await this.initialize();
    }
    return { status: 'success' };
  }

  private async initialize(): Promise<void> {
    this.isInitialized = true;
  }
}
`);

  const defaultModifiedCode = lang === 'python' ? `"""
${params.repoName} - Universal AST Module
Issue: ${params.issueDescription}
"""

class CoreEngine:
    def __init__(self, config=None):
        self.config = config or {}
        self._lock = True
        self.is_initialized = False

    def process_request(self, payload: dict) -> dict:
        # FIXED: Thread-safe atomic initialization
        with self._acquire_lock():
            if not self.is_initialized:
                self.initialize()
        return {"status": "success", "data": payload, "verified": True}

    def initialize(self):
        self.is_initialized = True
` : `/**
 * ${params.repoName} - Universal AST Module
 * Issue: ${params.issueDescription}
 */

export interface EngineConfig {
  retries: number;
  timeoutMs: number;
  enableSafetyChecks: boolean;
}

export class CoreEngine {
  private isInitialized = false;
  private mutexLock = new AsyncMutex();

  constructor(private config: EngineConfig) {}

  public async processRequest(payload: Record<string, unknown>): Promise<{ status: string }> {
    // FIXED: Atomic mutex locking across concurrent calls
    return await this.mutexLock.runExclusive(async () => {
      if (!this.isInitialized) {
        await this.initialize();
      }
      return { status: 'success', verified: true };
    });
  }

  private async initialize(): Promise<void> {
    this.isInitialized = true;
  }
}
`;

  const moduleNode: OGNodeData = {
    id: `mod-${cleanName}`,
    label: `${params.repoName} / Core`,
    type: 'module',
    path: `src/core.${ext}`,
    language: lang,
    linesCount: 84,
    tokenCount: 4200,
    compressedTokens: 840,
    status: 'idle',
    isExpanded: false,
    isLoaded: true,
    childrenIds: [`file-${cleanName}-engine`, `fn-${cleanName}-process`, `fn-${cleanName}-init`, `ast-${cleanName}-test`],
    exportSymbols: ['CoreEngine', 'processRequest', 'initialize'],
    dependencies: ['mutex', 'config'],
    signatures: [
      { name: 'CoreEngine', kind: 'class', lineStart: 10, lineEnd: 55, tokenCost: 350 },
      { name: 'processRequest', kind: 'method', lineStart: 18, lineEnd: 30, params: ['payload'], returnType: 'Promise<Result>', tokenCost: 180 },
      { name: 'initialize', kind: 'method', lineStart: 32, lineEnd: 42, tokenCost: 120 }
    ],
    description: `Universal AST root module ingested from ${params.repoUrl || 'User Code'}`
  };

  const fileNode: OGNodeData = {
    id: `file-${cleanName}-engine`,
    label: `core.${ext}`,
    type: 'file',
    path: `src/core.${ext}`,
    parentId: `mod-${cleanName}`,
    language: lang,
    linesCount: 55,
    tokenCount: 1800,
    compressedTokens: 320,
    status: 'idle',
    isLoaded: false,
    signatures: [
      { name: 'CoreEngine', kind: 'class', lineStart: 10, lineEnd: 55, tokenCost: 350 }
    ]
  };

  const fnNode: OGNodeData = {
    id: `fn-${cleanName}-process`,
    label: 'processRequest()',
    type: 'function',
    path: `src/core.${ext}`,
    parentId: `mod-${cleanName}`,
    language: lang,
    linesCount: 15,
    tokenCount: 850,
    compressedTokens: 140,
    status: 'idle',
    isLoaded: false,
    signatures: [
      { name: 'processRequest', kind: 'function', lineStart: 18, lineEnd: 30, tokenCost: 180 }
    ]
  };

  const assertionNode: OGNodeData = {
    id: `ast-${cleanName}-test`,
    label: 'assert_concurrency_safe()',
    type: 'assertion',
    path: `tests/test_core.${ext}`,
    parentId: `mod-${cleanName}`,
    language: lang,
    linesCount: 12,
    tokenCount: 520,
    compressedTokens: 95,
    status: 'idle',
    isLoaded: false,
    signatures: [
      { name: 'test_concurrency_lock', kind: 'assertion', lineStart: 5, lineEnd: 18, tokenCost: 110 }
    ]
  };

  const initialNodes: OGNodeData[] = [moduleNode, fileNode, fnNode, assertionNode];

  const initialEdges: OGEdgeData[] = [
    { id: `e-${cleanName}-1`, source: `mod-${cleanName}`, target: `file-${cleanName}-engine`, type: 'imports' },
    { id: `e-${cleanName}-2`, source: `file-${cleanName}-engine`, target: `fn-${cleanName}-process`, type: 'calls' },
    { id: `e-${cleanName}-3`, source: `fn-${cleanName}-process`, target: `ast-${cleanName}-test`, type: 'tests' },
  ];

  return {
    id,
    title: params.repoName,
    category: `Custom (${lang.toUpperCase()})`,
    description: params.issueDescription || `Custom ingested codebase from ${params.repoUrl || 'User Input'}`,
    benchmarkTarget: `${cleanName}-v1.0`,
    files: [
      {
        name: `core.${ext}`,
        path: `src/core.${ext}`,
        language: lang,
        initialCode: defaultInitialCode,
        modifiedCode: defaultModifiedCode,
      }
    ],
    initialNodes,
    initialEdges,
    sweBenchMetadata: {
      id: `${cleanName}-issue-101`,
      taskName: params.issueDescription || `${params.repoName} Core Fix`,
      module: `core.${ext}`,
      rawClaudeTokens: 215000,
      superbrainTokens: 58000,
      rawClaudeCost: 0.089,
      superbrainCost: 0.042,
      reductionPercentage: 73.0,
      status: 'VERIFIED' as const,
      testAssertionsPassed: 14,
      testAssertionsTotal: 14,
    }
  };
}

