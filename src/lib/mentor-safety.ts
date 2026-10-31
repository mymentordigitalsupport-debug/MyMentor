export function safetyReply(message: string) {
  const normalized = message.toLowerCase();
  const urgentPhrases = ["kill myself", "suicide", "end my life", "want to die", "hurt myself", "self harm", "harm myself"];
  if (!urgentPhrases.some((phrase) => normalized.includes(phrase))) return null;
  return "I am really sorry you're dealing with this. Please contact local emergency services or a crisis service now, and tell someone you trust who can stay with you.";
}
