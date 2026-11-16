type ChatRole = "user" | "assistant";

export type MentorChatInput = { role: ChatRole; content: string };

export class MentorInferenceError extends Error {
  constructor(public readonly status: number) {
    super(`Mentor AI request failed (${status}).`);
  }
}

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const WINDOW_MS = 10 * 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;
const requestWindows = new Map<string, { count: number; startedAt: number }>();
const DEFAULT_MENTOR_API_URL = "https://ai-api-service-5id6.onrender.com/api/text";
const DEFAULT_GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export function checkMentorRateLimit(key: string) {
  const now = Date.now();
  const current = requestWindows.get(key);
  if (!current || now - current.startedAt >= WINDOW_MS) {
    requestWindows.set(key, { count: 1, startedAt: now });
    return true;
  }
  if (current.count >= MAX_REQUESTS_PER_WINDOW) return false;
  current.count += 1;
  return true;
}

export async function generateMentorReply(messages: MentorChatInput[], knowledgeContext: string, availableRoutes: string) {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  const endpoint = new URL(process.env.MENTOR_AI_API_URL?.trim() || DEFAULT_MENTOR_API_URL);
  if (endpoint.protocol !== "https:") throw new Error("Mentor AI endpoint must use HTTPS.");

  const latestMemberMessage = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
  const prompt = [
    latestMemberMessage,
    knowledgeContext ? `Verified MyMentor facts:\n${knowledgeContext.slice(0, 1_600)}` : "",
    availableRoutes ? `Available My Mentor pages: ${availableRoutes}` : "",
  ].filter(Boolean).join("\n\n").slice(0, 2_400);
  endpoint.searchParams.set("prompt", prompt);
  try {
    const response = await fetch(endpoint, {
      headers: { Accept: "text/plain" },
      signal: AbortSignal.timeout(25_000),
    });
    if (response.ok) {
      const reply = (await response.text()).trim();
      if (reply) return reply.slice(0, 4_000);
    }
  } catch (error) {
    console.error("[mentor-ai] primary endpoint failed", error instanceof Error ? error.message : "unknown");
  }

  if (groqKey) {
    const response = await fetch(DEFAULT_GROQ_API_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${groqKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile",
        temperature: 0.4,
        max_tokens: 700,
        messages: [
          { role: "system", content: "You are My Mentor Guide. Give concise, compassionate, practical answers. Use only the verified facts supplied by the app. Never claim to be a human or provide medical, legal, or emergency care." },
          { role: "user", content: prompt },
        ],
      }),
      signal: AbortSignal.timeout(25_000),
    });
    if (!response.ok) throw new MentorInferenceError(response.status);
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const reply = payload.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error("Groq returned an empty response.");
    return reply.slice(0, 4_000);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await fetch(endpoint, {
        headers: { Accept: "text/plain" },
        signal: controller.signal,
      });

      if (response.ok) {
        const reply = (await response.text()).trim();
        if (!reply) throw new Error("Mentor AI returned an empty response.");
        return reply.slice(0, 4_000);
      }

      if (response.status !== 429 || attempt === 2) throw new MentorInferenceError(response.status);
      const retryAfter = Number(response.headers.get("retry-after"));
      await wait(Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter * 1_000, 4_000) : (attempt + 1) * 1_000);
    }

    throw new Error("Mentor AI did not return a response.");
  } finally {
    clearTimeout(timeout);
  }
}
