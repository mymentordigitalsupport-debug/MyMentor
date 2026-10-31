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
  const endpoint = new URL(process.env.MENTOR_AI_API_URL?.trim() || DEFAULT_MENTOR_API_URL);
  if (endpoint.protocol !== "https:") throw new Error("Mentor AI endpoint must use HTTPS.");

  const latestMemberMessage = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
  const prompt = [
    latestMemberMessage,
    knowledgeContext ? `Verified MyMentor facts:\n${knowledgeContext.slice(0, 1_600)}` : "",
    availableRoutes ? `Available My Mentor pages: ${availableRoutes}` : "",
  ].filter(Boolean).join("\n\n").slice(0, 2_400);
  endpoint.searchParams.set("prompt", prompt);

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
