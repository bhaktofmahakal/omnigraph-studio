import { NextResponse } from 'next/server';
import { DJANGO_SCENARIO_STEPS, INITIAL_AGENTS } from '@/lib/agents/psmasEngine';

export const runtime = 'nodejs';

// Role-to-Model Mapping via OrcaRouter AI Gateway
const AGENT_MODEL_MAP: Record<string, string> = {
  architect: 'openai/gpt-4o',
  codewriter: 'openai/gpt-4o-mini',
  testrunner: 'google/gemini-2.5-flash',
  security: 'deepseek/deepseek-chat',
};

export async function GET() {
  return NextResponse.json({
    status: 'success',
    engine: 'PSMAS Circular Manifold Engine v1.0',
    gateway: 'OrcaRouter AI Gateway + Groq Cloud',
    manifold: {
      domain: 'S^1 (0 to 2pi)',
      epsilonAttentionWindow: 0.785, // pi/4
      agents: INITIAL_AGENTS,
    },
    providers: {
      orcarouter: Boolean(process.env.ORCAROUTER_API_KEY),
      groq: Boolean(process.env.GROQ_API_KEY),
    },
    steps: DJANGO_SCENARIO_STEPS,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      prompt,
      activeAgent = 'architect',
      nodeContext,
      apiKey,
      model,
    } = body;

    const agentRole = activeAgent.toLowerCase();
    const selectedModel = model || AGENT_MODEL_MAP[agentRole] || 'openai/gpt-4o-mini';

    // Determine target provider (Groq vs OrcaRouter)
    const isGroqModel = selectedModel.startsWith('groq/') || selectedModel.includes('llama') || selectedModel.includes('mixtral');
    const isGroqKey = apiKey && apiKey.startsWith('gsk_');

    const shouldUseGroq = isGroqModel || isGroqKey || (!process.env.ORCAROUTER_API_KEY && Boolean(process.env.GROQ_API_KEY));

    const effectiveApiKey = apiKey || (shouldUseGroq ? process.env.GROQ_API_KEY : process.env.ORCAROUTER_API_KEY) || process.env.GROQ_API_KEY;

    const systemPrompts: Record<string, string> = {
      architect: `You are the Architect Agent (theta_1 = 0) in the PSMAS Multi-Agent Engine. Analyze AST dependencies, identify critical call sites, and emit structured traversal paths. Target AST Node: ${JSON.stringify(nodeContext || {})}`,
      codewriter: `You are the CodeWriter Agent (theta_2 = pi/2) in the PSMAS Multi-Agent Engine. Generate minimal, surgical unified git diff hunks (@@ -start,count +start,count @@). Target file: ${nodeContext?.path || 'src/engine/runner.ts'}`,
      testrunner: `You are the TestRunner Agent (theta_3 = pi) in the PSMAS Multi-Agent Engine. Synthesize precise unit test assertions and check regression coverage against SWE-bench specs.`,
      security: `You are the SecurityReviewer Agent (theta_4 = 3pi/2) in the PSMAS Multi-Agent Engine. Audit generated diffs for syntax anomalies, permission leaks, and invariant safety.`,
    };

    const systemPrompt = systemPrompts[agentRole] || systemPrompts.architect;

    // If an API Key is available, stream real LLM tokens via Groq Cloud or OrcaRouter Gateway
    if (effectiveApiKey) {
      const encoder = new TextEncoder();

      // Configure endpoint & model name
      let endpoint = 'https://api.orcarouter.ai/v1/chat/completions';
      let targetModel = selectedModel;

      if (shouldUseGroq || (effectiveApiKey && effectiveApiKey.startsWith('gsk_'))) {
        endpoint = 'https://api.groq.com/openai/v1/chat/completions';
        // Strip 'groq/' prefix for Groq direct API if present
        targetModel = selectedModel.replace(/^groq\//, '') || 'llama-3.3-70b-versatile';
      }

      const stream = new ReadableStream({
        async start(controller) {
          try {
            const res = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${effectiveApiKey}`,
              },
              body: JSON.stringify({
                model: targetModel,
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: prompt || `Execute ${activeAgent.toUpperCase()} phase on AST node ${nodeContext?.label || 'root'}` },
                ],
                stream: true,
              }),
            });

            if (!res.ok) {
              const errText = await res.text();
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errText })}\n\n`));
              controller.close();
              return;
            }

            if (!res.body) throw new Error('No stream body received');
            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value);
              controller.enqueue(encoder.encode(chunk));
            }
            controller.close();
          } catch (streamErr) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(streamErr) })}\n\n`));
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    // Fallback response if no key is configured
    return NextResponse.json({
      status: 'simulated_success',
      agent: activeAgent,
      model: selectedModel,
      response: {
        thought: `[Managed Engine Active] Evaluated AST node ${nodeContext?.label || 'root'} along phase manifold. Token reduction achieved.`,
        action: `Traversed ${nodeContext?.path || 'src/main.ts'} and queued next agent.`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'PSMAS Engine Execution Failed', details: String(err) },
      { status: 500 }
    );
  }
}
