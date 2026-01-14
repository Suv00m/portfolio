/**
 * Convert YouTube URLs to embed format
 */
export function convertToEmbedUrl(url: string): string {
  // YouTube watch URL: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (watchMatch) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  // Already an embed URL
  if (url.includes('youtube.com/embed/')) {
    return url;
  }

  // Return as-is for other URLs (Twitter, etc.)
  return url;
}

import { addCopyButtonsToCodeBlocks } from './code-copy-utils';

/**
 * Process HTML content to ensure embeds are properly formatted and add copy buttons to code blocks
 */
export function processEmbedContent(html: string): string {
  if (!html) return html;
  
  // First, unescape any HTML entities that might have been escaped
  let processed = html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&');
  
  // Find all iframe elements and ensure YouTube URLs are converted
  processed = processed.replace(/<iframe[^>]*src=["']([^"']+)["'][^>]*>/gi, (match, src) => {
    const embedUrl = convertToEmbedUrl(src);
    // Replace the src in the iframe tag, handling both single and double quotes
    if (match.includes(`src="${src}"`)) {
      return match.replace(`src="${src}"`, `src="${embedUrl}"`);
    } else if (match.includes(`src='${src}'`)) {
      return match.replace(`src='${src}'`, `src='${embedUrl}'`);
    }
    return match;
  });
  
  // Ensure iframes have proper attributes and are properly closed
  processed = processed.replace(/<iframe([^>]*?)(?:\/)?>/gi, (match, attributes) => {
    // Add allowfullscreen if not present
    if (!attributes.includes('allowfullscreen') && !attributes.includes('allowFullscreen')) {
      attributes += ' allowfullscreen';
    }
    // Add allow attribute if not present
    if (!attributes.includes('allow=')) {
      attributes += ' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"';
    }
    // Ensure width and height are set
    if (!attributes.includes('width=')) {
      attributes += ' width="100%"';
    }
    if (!attributes.includes('height=')) {
      attributes += ' height="400"';
    }
    if (!attributes.includes('frameborder=')) {
      attributes += ' frameborder="0"';
    }
    // Ensure iframe is properly closed
    return `<iframe${attributes}></iframe>`;
  });
  
  // Handle embed-container divs - keep them for styling
  processed = processed.replace(/<div[^>]*class=["'][^"']*embed-container[^"']*["'][^>]*>(<iframe[^>]*><\/iframe>)<\/div>/gi, '<div class="embed-container my-4">$1</div>');
  
  // Remove any other div wrappers around iframes
  processed = processed.replace(/<div[^>]*class=["']embed-wrapper[^"']*["'][^>]*>(<iframe[^>]*><\/iframe>)<\/div>/gi, '$1');
  
  // Add copy buttons to code blocks
  processed = addCopyButtonsToCodeBlocks(processed);
  
  return processed;
}
