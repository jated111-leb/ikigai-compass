// AI Coach edge function — streams from Claude Haiku 4.5 via the Anthropic API.
//
// The client (src/lib/ai-service.ts) posts OpenAI-style { model, messages }
// (system message first) and parses OpenAI-shaped SSE
// (`data: {"choices":[{"delta":{"content"}}]}`). To keep the client unchanged,
// this function converts the request to Anthropic's Messages format and
// translates Anthropic's stream back into that OpenAI SSE shape.
//
// Requires ANTHROPIC_API_KEY. Interactive (user is waiting) so it streams and
// is NOT batched; prompt caching is applied to the (large, reused) system prefix.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MODEL = "claude-haiku-4-5";
const ANTHROPIC_VERSION = "2023-06-01";
const MAX_TOKENS = 1024;

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return jsonError("ANTHROPIC_API_KEY not configured", 500);

  let body: { messages?: ChatMessage[]; model?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("invalid JSON body", 400);
  }
  if (!Array.isArray(body.messages)) return jsonError("messages must be an array", 400);

  // Split system from conversation. Multiple system messages are concatenated.
  const system = body.messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
  const convo = body.messages.filter((m) => m.role !== "system") as ChatMessage[];
  // Anthropic requires the first message to be `user`; the coach's history can
  // start with the assistant's opening reflection — drop leading assistant turns.
  while (convo.length && convo[0].role === "assistant") convo.shift();
  if (!convo.length) convo.push({ role: "user", content: "Begin." });

  const model = typeof body.model === "string" && body.model.startsWith("claude") ? body.model : MODEL;

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: MAX_TOKENS,
      stream: true,
      // Prompt caching on the system prefix (helps on longer later-module
      // contexts; the cacheable minimum is 4096 tokens on Haiku 4.5).
      system: system ? [{ type: "text", text: system, cache_control: { type: "ephemeral" } }] : undefined,
      messages: convo.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    if (upstream.status === 429) return jsonError("Rate limit exceeded. Please try again shortly.", 429);
    return jsonError(`Upstream error ${upstream.status}: ${text.slice(0, 300)}`, 500);
  }

  // Translate Anthropic SSE -> OpenAI-style SSE the client already parses.
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const stream = new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const t = line.trim();
        if (!t.startsWith("data:")) continue;
        const data = t.slice(5).trim();
        if (!data) continue;
        try {
          const evt = JSON.parse(data);
          if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta" && evt.delta.text) {
            controller.enqueue(encoder.encode(
              `data: ${JSON.stringify({ choices: [{ delta: { content: evt.delta.text } }] })}\n\n`,
            ));
          }
        } catch { /* skip non-JSON (e.g. `event:` lines) */ }
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
});
