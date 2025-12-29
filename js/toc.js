(function() {
  // Generate table of contents from article headings
  function generateTOC() {
    var content = document.querySelector('.post-content');
    var tocContainer = document.querySelector('.post-toc ol');

    if (!content || !tocContainer) return;

    // Get all h2 and h3 headings
    var headings = content.querySelectorAll('h2, h3');

    if (headings.length === 0) {
      // Hide TOC if no headings
      var tocSection = document.querySelector('.post-sidebar-right');
      if (tocSection) tocSection.style.display = 'none';
      return;
    }

    // Clear existing TOC
    tocContainer.innerHTML = '';

    var currentH2Li = null;
    var currentH3List = null;

    headings.forEach(function(heading, index) {
      // Add ID to heading if it doesn't have one
      if (!heading.id) {
        heading.id = 'heading-' + index;
      }

      if (heading.tagName === 'H2') {
        // Create new H2 item
        currentH2Li = document.createElement('li');
        var a = document.createElement('a');
        a.href = '#' + heading.id;
        a.textContent = heading.textContent;
        currentH2Li.appendChild(a);
        tocContainer.appendChild(currentH2Li);
        currentH3List = null;
      } else if (heading.tagName === 'H3') {
        // Create H3 item as child of last H2
        if (!currentH2Li) {
          // If we have H3 without H2, create it at root level
          currentH2Li = document.createElement('li');
          tocContainer.appendChild(currentH2Li);
        }

        // Create nested list if it doesn't exist
        if (!currentH3List) {
          currentH3List = document.createElement('ol');
          currentH2Li.appendChild(currentH3List);
        }

        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = '#' + heading.id;
        a.textContent = heading.textContent;
        li.appendChild(a);
        currentH3List.appendChild(li);
      }
    });
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', generateTOC);
  } else {
    generateTOC();
  }
})();
