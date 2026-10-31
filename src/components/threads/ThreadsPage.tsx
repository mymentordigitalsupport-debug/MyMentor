"use client";

import { useState } from "react";
import { ThreadsHero } from "./ThreadsHero";
import { ThreadsCommunity } from "./ThreadsCommunity";

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    block: "start",
  });
}

export function ThreadsPage() {
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");

  function writeThread(prompt?: string) {
    if (prompt !== undefined) setDraft(prompt);
    document.getElementById("thread-body")?.focus({ preventScroll: true });
    scrollTo("thread-composer");
  }

  return <main className="min-h-screen bg-sand text-text">
    <ThreadsHero searchValue={query} onSearch={(value) => { setQuery(value); scrollTo("threads-conversations"); }} onStartConversation={writeThread} />
    <ThreadsCommunity query={query} onQueryChange={setQuery} draft={draft} onDraftChange={setDraft} onWrite={() => writeThread()} />
  </main>;
}
