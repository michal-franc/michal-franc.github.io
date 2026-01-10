(function() {
  'use strict';

  // Capitalize first letter
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Convert markdown links to HTML
  function parseMarkdownLinks(text) {
    // Match [text](url) pattern
    return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  }

  // Convert markdown bold to HTML
  function parseMarkdownBold(text) {
    // Match **text** pattern
    return text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  }

  // Check if text is a bullet list
  function isBulletList(text) {
    const lines = text.split('\n');
    return lines.every(function(line) {
      return line.trim() === '' || /^[-*]\s+/.test(line.trim());
    });
  }

  // Convert markdown bullet list to HTML
  function parseBulletList(text) {
    const lines = text.split('\n');
    const items = lines
      .filter(function(line) { return line.trim() !== ''; })
      .map(function(line) {
        const content = line.trim().replace(/^[-*]\s+/, '');
        return '<li>' + parseMarkdownBold(parseMarkdownLinks(content)) + '</li>';
      });
    return '<ul>' + items.join('') + '</ul>';
  }

  // Parse and convert admonitions
  function parseAdmonitions() {
    // Find all code blocks in the post content
    const postContent = document.querySelector('.post-content');
    if (!postContent) return;

    // Find all pre > code elements with language-ad-* classes
    const codeBlocks = postContent.querySelectorAll('pre > code[class*="language-ad-"]');

    codeBlocks.forEach(function(codeBlock) {
      // Extract the admonition type from the class name
      const classList = codeBlock.className.split(' ');
      let adType = null;

      for (let i = 0; i < classList.length; i++) {
        const match = classList[i].match(/^language-ad-(\w+)$/);
        if (match) {
          adType = match[1].toLowerCase();
          break;
        }
      }

      if (!adType) return;

      // Get the content
      let content = (codeBlock.textContent || codeBlock.innerText).trim();

      // Extract custom title if present (format: _title_)
      let customTitle = null;
      const titleMatch = content.match(/^_(.+?)_/);
      if (titleMatch) {
        customTitle = titleMatch[1];
        // Remove the title from content
        content = content.replace(/^_(.+?)_\s*/, '').trim();
      }

      // Create admonition HTML
      const admonition = document.createElement('div');
      admonition.className = 'admonition ad-' + adType;

      const title = document.createElement('div');
      title.className = 'admonition-title';

      // Set title text: "Type" or "Type - Custom Title"
      if (customTitle) {
        title.textContent = capitalize(adType) + ' - ' + customTitle;
      } else {
        title.textContent = capitalize(adType);
      }

      const adContent = document.createElement('div');
      adContent.className = 'admonition-content';

      // Parse markdown-style content (basic support)
      if (content) {
        const contentHTML = content
          .split('\n\n')
          .map(function(para) {
            if (para.trim()) {
              // Convert --- to horizontal rule
              if (para.trim() === '---') {
                return '<hr>';
              }
              // Convert bullet lists
              if (isBulletList(para.trim())) {
                return parseBulletList(para.trim());
              }
              return '<p>' + parseMarkdownBold(parseMarkdownLinks(para.trim())) + '</p>';
            }
            return '';
          })
          .join('');

        adContent.innerHTML = contentHTML;
      }

      admonition.appendChild(title);
      admonition.appendChild(adContent);

      // Replace the pre element with the admonition
      const preElement = codeBlock.parentElement;
      if (preElement && preElement.tagName === 'PRE') {
        preElement.parentElement.replaceChild(admonition, preElement);
      }
    });
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', parseAdmonitions);
  } else {
    parseAdmonitions();
  }
})();
