export function ArticleBody({ markdown }: { markdown: string }) {
  return (
    <div className="space-y-5 text-[1.05rem] leading-8 text-[#3f463f]">
      {markdown.split(/\n{2,}/).filter(Boolean).map((block, index) => {
        const text = block.trim();
        if (text.startsWith("### ")) return <h3 key={index} className="pt-3 text-xl font-semibold text-forest">{text.slice(4)}</h3>;
        if (text.startsWith("## ")) return <h2 key={index} className="pt-5 text-3xl font-semibold tracking-tight text-forest">{text.slice(3)}</h2>;
        if (text.startsWith("# ")) return <h2 key={index} className="pt-5 text-3xl font-semibold tracking-tight text-forest">{text.slice(2)}</h2>;
        if (text.split("\n").every((line) => line.startsWith("- "))) return <ul key={index} className="list-disc space-y-2 pl-6">{text.split("\n").map((line) => <li key={line}>{line.slice(2)}</li>)}</ul>;
        return <p key={index} className="whitespace-pre-line">{text}</p>;
      })}
    </div>
  );
}
