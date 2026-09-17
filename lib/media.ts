// Best-effort YouTube URL -> embeddable URL. Anything else (Instagram, Drive, etc.)
// falls back to a plain link-out — no oEmbed dependency for a "nice to have".
export function toYoutubeEmbedUrl(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{6,})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
}

export function isEmbeddableVideoUrl(url: string): boolean {
  return toYoutubeEmbedUrl(url) !== null;
}
