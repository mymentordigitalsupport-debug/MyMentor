type ChatRole = "user" | "assistant";

export type MentorChatInput = { role: ChatRole; content: string };

export class MentorInferenceError extends Error {
  constructor(public readonly status: number) {
    super(`Mistral request failed (${status}).`);
  }
}

const WINDOW_MS = 10 * 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;
const requestWindows = new Map<string, { count: number; startedAt: number }>();

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

export async function generateMentorReply(messages: MentorChatInput[], memberContext: string) {
  const token = process.env.MISTRAL_API_KEY?.trim();
  if (!token) throw new Error("Mentor AI is not configured.");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral-small-latest",
        temperature: 0.5,
        max_tokens: 420,
        messages: [
          {
            role: "system",
            content: `You are My Mentor Guide, a warm and practical guide for My Mentor. Keep responses concise, supportive and grounded. Do not claim to be a therapist or give diagnosis. For an immediate risk of harm, urge the person to contact local emergency services or a crisis line. Use only the supplied account context; never invent account data or claim to have changed data. Do not request passwords, access tokens, payment details, or other secrets. ${memberContext}`,
          },
          ...messages,
        ],
      }),
      signal: controller.signal,
    });
    if (!response.ok) throw new MentorInferenceError(response.status);
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error("Mentor AI returned an empty response.");
    return reply.slice(0, 4_000);
  } finally {
    clearTimeout(timeout);
  }
}
