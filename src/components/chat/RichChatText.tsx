import type { ReactNode } from "react";

const COLORS = {
  forest: "text-[#25412f]",
  sage: "text-[#64805d]",
  gold: "text-[#9a722d]",
  rose: "text-[#9d5c67]",
  muted: "text-[#68766b]",
} as const;

function inline(value: string): ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|\[color=(?:forest|sage|gold|rose|muted)\][\s\S]*?\[\/color\])/g;
  return value.split(pattern).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index} className="font-semibold">{part.slice(2, -2)}</strong>;
    if (part.startsWith("__") && part.endsWith("__")) return <span key={index} className="underline decoration-[#8ca881] decoration-2 underline-offset-2">{part.slice(2, -2)}</span>;
    if (part.startsWith("~~") && part.endsWith("~~")) return <span key={index} className="line-through decoration-[#a86a72]">{part.slice(2, -2)}</span>;
    const color = part.match(/^\[color=(forest|sage|gold|rose|muted)\]([\s\S]*)\[\/color\]$/);
    if (color) return <span key={index} className={COLORS[color[1] as keyof typeof COLORS]}>{color[2]}</span>;
    return part;
  });
}

export function RichChatText({ value }: { value: string }) {
  const lines = value.split("\n");
  const nodes: ReactNode[] = [];

  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const size = heading[1].length === 1 ? "text-lg" : heading[1].length === 2 ? "text-base" : "text-sm";
      nodes.push(<p key={index} className={`${size} font-semibold leading-6 text-[#25412f]`}>{inline(heading[2])}</p>);
      index += 1;
      continue;
    }
    if (line.startsWith("> ")) {
      nodes.push(<blockquote key={index} className="border-l-2 border-[#bca15c] bg-[#fbf8ef] py-2 pl-3 pr-2 text-[#526452]">{inline(line.slice(2))}</blockquote>);
      index += 1;
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items: ReactNode[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index])) {
        items.push(<li key={index}>{inline(lines[index].replace(/^[-*]\s+/, ""))}</li>);
        index += 1;
      }
      nodes.push(<ul key={`list-${index}`} className="list-disc space-y-1 pl-5 marker:text-[#789071]">{items}</ul>);
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items: ReactNode[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
        items.push(<li key={index}>{inline(lines[index].replace(/^\d+\.\s+/, ""))}</li>);
        index += 1;
      }
      nodes.push(<ol key={`list-${index}`} className="list-decimal space-y-1 pl-5 marker:font-semibold marker:text-[#789071]">{items}</ol>);
      continue;
    }
    if (line.trim()) nodes.push(<p key={index}>{inline(line)}</p>);
    index += 1;
  }

  return <div className="space-y-2">{nodes}</div>;
}
