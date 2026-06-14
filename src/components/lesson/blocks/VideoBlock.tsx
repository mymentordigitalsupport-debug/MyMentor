interface VideoBlockContent {
  title?: string;
  url?: string;
  placeholder?: boolean;
  description?: string;
}

export function VideoBlock({ content }: { content: VideoBlockContent }) {
  return (
    <div className="rounded-3xl overflow-hidden bg-forest/10 border border-forest/15">
      {content.url ? (
        <video
          src={content.url}
          controls
          className="w-full aspect-video"
          aria-label={content.title ?? "Mentor video"}
        />
      ) : (
        <div className="aspect-video flex flex-col items-center justify-center gap-3 text-muted p-6">
          <div className="w-16 h-16 rounded-full bg-forest/10 border border-forest/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-forest/50 ml-1">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          {content.title && (
            <p className="font-medium text-text text-sm">{content.title}</p>
          )}
          {content.description && (
            <p className="text-xs text-muted text-center">{content.description}</p>
          )}
          <p className="text-xs text-muted/60">Video coming soon</p>
        </div>
      )}
    </div>
  );
}
