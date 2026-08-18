import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Full Public GitHub Repository Ingestion Engine
 * Uses GitHub's Recursive Git Tree API (?recursive=1) to discover every file
 * across the entire repository in a single request, filters out build artifacts,
 * and fetches source files in parallel for AST compilation.
 */

const CODE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java',
  '.c', '.cpp', '.h', '.cs', '.rb', '.swift', '.kt', '.scala',
  '.vue', '.svelte', '.astro', '.php', '.json', '.md',
]);

const IGNORED_PATHS = [
  'node_modules/', '.git/', 'dist/', 'build/', '.next/', 'coverage/',
  'vendor/', '__pycache__/', '.venv/', 'venv/', '.vscode/', '.idea/',
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'Cargo.lock',
];

const MAX_DOWNLOAD_FILES = 30; // Download up to 30 primary source files for AST parsing
const MAX_FILE_SIZE = 75000; // 75KB per file to avoid huge binaries

export async function POST(req: Request) {
  try {
    const { repoUrl } = await req.json();
    if (!repoUrl || typeof repoUrl !== 'string') {
      return NextResponse.json({ error: 'Missing repository URL' }, { status: 400 });
    }

    // Parse GitHub URL: https://github.com/owner/repo or https://github.com/owner/repo/tree/branch
    const urlMatch = repoUrl.match(
      /github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/tree\/([^/]+)(?:\/(.+))?)?$/
    );
    if (!urlMatch) {
      return NextResponse.json({
        error: 'Invalid GitHub URL format. Expected: https://github.com/owner/repo',
      }, { status: 400 });
    }

    const owner = urlMatch[1];
    const repo = urlMatch[2];
    let branch = urlMatch[3] || 'main';

    // 1. Fetch Repository Metadata to get default branch if not specified
    const repoMetaRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'OmniGraph-Studio/1.0',
      },
    });

    if (!repoMetaRes.ok) {
      if (repoMetaRes.status === 404) {
        return NextResponse.json({
          error: `Repository ${owner}/${repo} not found. Ensure the repository is PUBLIC.`,
        }, { status: 404 });
      }
      if (repoMetaRes.status === 403) {
        return NextResponse.json({
          error: 'GitHub API rate limit exceeded. Please wait a minute or use the "Paste Code" tab.',
        }, { status: 429 });
      }
    } else {
      const repoMeta = await repoMetaRes.json();
      if (!urlMatch[3] && repoMeta.default_branch) {
        branch = repoMeta.default_branch;
      }
    }

    // 2. Query GitHub Recursive Git Tree API (?recursive=1)
    let treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'OmniGraph-Studio/1.0',
        },
      }
    );

    // Fallback to 'master' if 'main' fails
    if (!treeRes.ok && branch === 'main') {
      branch = 'master';
      treeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'OmniGraph-Studio/1.0',
          },
        }
      );
    }

    if (!treeRes.ok) {
      const errText = await treeRes.text();
      return NextResponse.json({
        error: `Could not retrieve file tree for ${owner}/${repo} (${branch}): ${errText.slice(0, 150)}`,
      }, { status: treeRes.status });
    }

    const treeData = await treeRes.json();
    const treeItems: any[] = treeData.tree || [];

    // 3. Filter valid source code files across the whole repo
    const eligibleFiles = treeItems.filter((item: any) => {
      if (item.type !== 'blob') return false; // Blobs = files
      const path: string = item.path;

      // Filter out ignored folders & lockfiles
      if (IGNORED_PATHS.some((ignored) => path.includes(ignored))) return false;

      // Check code extension
      const ext = '.' + (path.split('.').pop() || '').toLowerCase();
      if (!CODE_EXTENSIONS.has(ext)) return false;

      // Filter file size if size metadata is available
      if (item.size && item.size > MAX_FILE_SIZE) return false;

      return true;
    });

    if (eligibleFiles.length === 0) {
      return NextResponse.json({
        error: `No supported source code files found in ${owner}/${repo}.`,
      }, { status: 404 });
    }

    // Priority sorting: Put src/, lib/, core/ files first
    const prioritizedFiles = eligibleFiles.sort((a, b) => {
      const scoreA = a.path.startsWith('src/') || a.path.startsWith('lib/') ? 2 : 1;
      const scoreB = b.path.startsWith('src/') || b.path.startsWith('lib/') ? 2 : 1;
      return scoreB - scoreA;
    }).slice(0, MAX_DOWNLOAD_FILES);

    // 4. Download source code in parallel from raw GitHub CDN
    const downloadPromises = prioritizedFiles.map(async (file: any) => {
      try {
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`;
        const contentRes = await fetch(rawUrl, {
          headers: { 'User-Agent': 'OmniGraph-Studio/1.0' },
        });
        if (!contentRes.ok) return null;
        const content = await contentRes.text();
        return {
          name: file.path.split('/').pop() || file.path,
          path: file.path,
          content,
          size: content.length,
        };
      } catch {
        return null;
      }
    });

    const downloadedResults = await Promise.all(downloadPromises);
    const validFiles = downloadedResults.filter(Boolean) as {
      name: string;
      path: string;
      content: string;
      size: number;
    }[];

    // 5. Detect primary programming language across downloaded files
    const extCount: Record<string, number> = {};
    for (const f of validFiles) {
      const ext = (f.name.split('.').pop() || '').toLowerCase();
      extCount[ext] = (extCount[ext] || 0) + 1;
    }
    const primaryExt = Object.entries(extCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'ts';
    const languageMap: Record<string, string> = {
      ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
      py: 'python', go: 'go', rs: 'rust', java: 'java',
      c: 'c', cpp: 'cpp', cs: 'csharp', rb: 'ruby', swift: 'swift', kt: 'kotlin',
    };
    const detectedLanguage = languageMap[primaryExt] || 'typescript';

    return NextResponse.json({
      status: 'success',
      repo: `${owner}/${repo}`,
      branch,
      totalTreeFiles: treeItems.length,
      eligibleCodeFiles: eligibleFiles.length,
      downloadedFilesCount: validFiles.length,
      language: detectedLanguage,
      files: validFiles,
    });
  } catch (err) {
    return NextResponse.json({
      error: `Server failed to process repository: ${String(err)}`,
    }, { status: 500 });
  }
}
