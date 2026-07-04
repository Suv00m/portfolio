export function formatLinkDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

// Falls back to a clean domain when the author left the raw URL as the label (or no label at all).
export function formatLinkLabel(link: { text: string; url: string }): string {
  const text = link.text.trim();
  const bareUrl = link.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const bareText = text.replace(/^https?:\/\//, '').replace(/\/$/, '');

  if (!text || bareText === bareUrl) {
    return formatLinkDomain(link.url);
  }
  return text;
}
