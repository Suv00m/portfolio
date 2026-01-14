/**
 * Add copy buttons to code blocks in HTML content
 * Prism.js will handle syntax highlighting on the client side
 */
export function addCopyButtonsToCodeBlocks(html: string): string {
  if (!html) return html;

  // Match <pre> blocks (with optional <code> inside)
  const prePattern = /<pre[^>]*>([\s\S]*?)<\/pre>/gi;
  
  return html.replace(prePattern, (match, codeContent) => {
    // Generate a unique ID for this code block
    const blockId = `code-block-${Math.random().toString(36).substring(2, 11)}`;
    
    // Extract the actual code text (remove HTML tags from code content)
    const textContent = codeContent
      .replace(/<code[^>]*>/gi, '')
      .replace(/<\/code>/gi, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&amp;/g, '&');
    
    // Create the copy button HTML
    const copyButton = `
      <button 
        class="code-copy-btn" 
        data-code-id="${blockId}"
        data-code-content="${escapeHtml(textContent)}"
        title="Copy code"
        aria-label="Copy code to clipboard"
      >
        <svg class="code-copy-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <svg class="code-copy-check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </button>
    `;
    
    // Wrap the pre in a container with cream/white background and Tailwind classes
    // Add language class for Prism (try to detect from code content or default to text)
    const language = detectLanguage(textContent);
    return `<div class="code-block-wrapper relative my-4 rounded-lg overflow-hidden border border-gray-300 bg-amber-50 shadow-sm" data-code-id="${blockId}">${copyButton}<pre class="p-4 pt-12 overflow-x-auto text-sm leading-relaxed font-mono" data-code-id="${blockId}"><code class="language-${language} block whitespace-pre">${escapeHtmlForCode(textContent)}</code></pre></div>`;
  });
}

/**
 * Detect programming language from code content
 */
function detectLanguage(code: string): string {
  const codeLower = code.trim().toLowerCase();
  
  // Check for language-specific patterns
  if (codeLower.includes('from') && codeLower.includes('import') && (codeLower.includes('def ') || codeLower.includes('class '))) {
    return 'python';
  }
  if (codeLower.includes('function') || codeLower.includes('const ') || codeLower.includes('let ') || codeLower.includes('=>')) {
    return 'javascript';
  }
  if (codeLower.includes('interface') || codeLower.includes('type ') || codeLower.includes(': string') || codeLower.includes(': number')) {
    return 'typescript';
  }
  if (codeLower.includes('models:') || codeLower.includes('merge_method:') || codeLower.includes('base_model:')) {
    return 'yaml';
  }
  if (codeLower.includes('{') && codeLower.includes('}') && (codeLower.includes('"') || codeLower.includes("'"))) {
    return 'json';
  }
  if (codeLower.includes('<!doctype') || codeLower.includes('<html') || codeLower.includes('<div')) {
    return 'html';
  }
  if (codeLower.includes('@media') || codeLower.includes('@import') || codeLower.includes('{') && codeLower.includes(':')) {
    return 'css';
  }
  
  return 'text';
}

/**
 * Escape HTML for code display (but keep it as plain text for Prism to process)
 */
function escapeHtmlForCode(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Escape HTML for use in data attributes
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\n/g, '&#10;')
    .replace(/\r/g, '&#13;');
}

/**
 * Initialize copy button functionality and Prism syntax highlighting
 * Call this after the HTML is rendered in the DOM
 */
export function initializeCopyButtons(container: HTMLElement | null): void {
  if (!container) return;

  // Initialize Prism.js for syntax highlighting
  const highlightWithPrism = () => {
    if (typeof window !== 'undefined' && (window as any).Prism) {
      const Prism = (window as any).Prism;
      const codeBlocks = container.querySelectorAll('pre code[class*="language-"]');
      codeBlocks.forEach((block) => {
        // Only highlight if not already highlighted
        if (!block.classList.contains('language-')) {
          Prism.highlightElement(block as HTMLElement);
        }
      });
    } else {
      // Retry after a short delay if Prism isn't loaded yet
      setTimeout(highlightWithPrism, 100);
    }
  };

  // Try to highlight immediately, or wait for Prism to load
  highlightWithPrism();

  const copyButtons = container.querySelectorAll('.code-copy-btn');
  
  copyButtons.forEach((button) => {
    // Remove existing listeners to avoid duplicates
    const newButton = button.cloneNode(true) as HTMLElement;
    button.parentNode?.replaceChild(newButton, button);
    
    newButton.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const codeContent = newButton.getAttribute('data-code-content');
      if (!codeContent) return;
      
      // Unescape HTML entities
      const textToCopy = codeContent
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&#10;/g, '\n')
        .replace(/&#13;/g, '\r');
      
      try {
        await navigator.clipboard.writeText(textToCopy);
        
        // Show success feedback
        const icon = newButton.querySelector('.code-copy-icon') as HTMLElement;
        const check = newButton.querySelector('.code-copy-check') as HTMLElement;
        
        if (icon && check) {
          icon.style.display = 'none';
          check.style.display = 'block';
          newButton.classList.add('copied');
          
          // Reset after 2 seconds
          setTimeout(() => {
            icon.style.display = 'block';
            check.style.display = 'none';
            newButton.classList.remove('copied');
          }, 2000);
        }
      } catch (err) {
        console.error('Failed to copy code:', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (fallbackErr) {
          console.error('Fallback copy failed:', fallbackErr);
        }
        document.body.removeChild(textArea);
      }
    });
  });
}
