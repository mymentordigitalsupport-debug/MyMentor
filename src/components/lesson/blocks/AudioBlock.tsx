interface AudioBlockContent {
  title?: string;
  url?: string;
}

export function AudioBlock({ content }: { content: AudioBlockContent }) {
  return (
    <div className="bg-cream border border-mist rounded-2xl p-5">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-sage/15 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-sage">
            <path
              d="M9 18V5l12-2v13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
            <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted font-medium uppercase tracking-wide mb-1">
            Audio
          </p>
          <p className="font-medium text-text text-sm truncate">
            {content.title ?? "Guided Audio"}
          </p>
        </div>
      </div>

      {content.url ? (
        <audio
          src={content.url}
          controls
          className="w-full mt-4"
          aria-label={content.title ?? "Audio track"}
        />
      ) : (
        <p className="text-xs text-muted mt-3 text-center">Audio coming soon</p>
      )}
    </div>
  );
}
