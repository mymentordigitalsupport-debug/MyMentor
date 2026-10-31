import { type Resource, type ResourceCategory } from "@/types";

const CATEGORY_CONFIG: Record<ResourceCategory, { emoji: string; label: string }> = {
  worksheet: { emoji: "📋", label: "Worksheet" },
  audio:     { emoji: "🎧", label: "Audio" },
  video:     { emoji: "🎬", label: "Video" },
  reading:   { emoji: "📖", label: "Reading" },
  support:   { emoji: "🤝", label: "Support" },
};

export function ResourceCard({ resource }: { resource: Resource }) {
  const config = CATEGORY_CONFIG[resource.category] ?? { emoji: "📄", label: resource.category };

  const inner = (
    <div className="bg-cream border border-mist rounded-2xl p-5 hover:border-sage/40 hover:shadow-sm transition-all duration-200">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-mist flex items-center justify-center text-xl shrink-0">
          {config.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-muted font-medium">{config.label}</span>
          </div>
          <p className="font-medium text-text leading-snug mb-1">{resource.title}</p>
          {resource.description && (
            <p className="text-xs text-muted leading-relaxed">{resource.description}</p>
          )}
        </div>
        {resource.url && (
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-muted shrink-0 mt-1">
            <path
              d="M7 17L17 7M17 7H7M17 7v10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </div>
  );

  if (resource.url) {
    return (
      <a href={resource.url} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }

  return inner;
}
