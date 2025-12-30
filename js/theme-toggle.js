(function() {
  'use strict';

  const THEME_KEY = 'theme-preference';
  const DARK_THEME_CLASS = 'dark-theme';

  // Check for saved theme preference or default to light mode
  function getThemePreference() {
    return localStorage.getItem(THEME_KEY) || 'light';
  }

  // Save theme preference to localStorage
  function saveThemePreference(theme) {
    localStorage.setItem(THEME_KEY, theme);
  }

  // Update giscus theme
  function updateGiscusTheme(theme) {
    const giscusTheme = theme === 'dark' ? 'dark' : 'light';

    // Send message to giscus iframe to change theme
    const iframe = document.querySelector('iframe.giscus-frame');
    if (iframe) {
      iframe.contentWindow.postMessage(
        { giscus: { setConfig: { theme: giscusTheme } } },
        'https://giscus.app'
      );
    }
  }

  // Apply theme to document
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add(DARK_THEME_CLASS);
    } else {
      document.body.classList.remove(DARK_THEME_CLASS);
    }

    // Update giscus theme if comments are loaded
    updateGiscusTheme(theme);
  }

  // Toggle between light and dark theme
  function toggleTheme() {
    const currentTheme = getThemePreference();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    saveThemePreference(newTheme);
    applyTheme(newTheme);
  }

  // Initialize theme on page load
  function initTheme() {
    const savedTheme = getThemePreference();
    applyTheme(savedTheme);

    // Add click event listener to toggle button
    const toggleButton = document.getElementById('theme-toggle');
    if (toggleButton) {
      toggleButton.addEventListener('click', toggleTheme);
    }

    // Listen for giscus load event and apply theme
    window.addEventListener('message', function(event) {
      if (event.origin === 'https://giscus.app') {
        // When giscus is loaded, apply the current theme
        updateGiscusTheme(savedTheme);
      }
    });
  }

  // Run initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }
})();
