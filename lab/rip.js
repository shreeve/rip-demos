/**
 * Rip Browser Loader
 *
 * Usage:
 *   <script type="module" src="/rip.js" rip="/app.rip"></script>
 *
 * Options:
 *   rip="/path/to/app.rip"     - Entry file to load and run
 *   rip-target="#app"          - Mount target (default: #app)
 *   rip-deps="/a.rip,/b.rip"   - Comma-separated dependency files to load first
 */

import { compileToJS } from './rip.browser.js';

// Find our script element (document.currentScript is null in modules)
const scriptEl = document.querySelector('script[src*="rip.js"][rip]')
              || document.querySelector('script[src*="rip.js"][rip-src]');

if (!scriptEl) {
  throw new Error('Rip: No entry file specified. Add rip="/app.rip" to your script tag.');
}

// Read configuration from attributes
const entry = scriptEl.getAttribute('rip') || scriptEl.getAttribute('rip-src');
const deps = scriptEl.getAttribute('rip-deps')?.split(',').map(s => s.trim()).filter(Boolean) || [];
const target = scriptEl.getAttribute('rip-target') || '#app';

// Resolve URL relative to document
function resolveUrl(path) {
  return new URL(path, document.baseURI).href;
}

// Fetch and compile a single .rip file
async function loadRip(path) {
  const url = resolveUrl(path);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status} ${response.statusText}`);
  }

  const source = await response.text();

  try {
    return compileToJS(source);
  } catch (error) {
    throw new Error(`Compilation error in ${path}: ${error.message}`);
  }
}

// Main loader
async function run() {
  try {
    // Load dependencies first (in order)
    const depJs = [];
    for (const dep of deps) {
      depJs.push(await loadRip(dep));
    }

    // Load entry file
    const entryJs = await loadRip(entry);

    // Combine all compiled JS
    const combined = [...depJs, entryJs].join('\n');

    // Execute via dynamic import
    const blob = new Blob([combined], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);

    await import(url);

    // Cleanup
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Rip:', error);

    // Show error in target element if it exists
    const el = document.querySelector(target);
    if (el) {
      el.innerHTML = `
        <div style="padding: 2rem; font-family: ui-monospace, monospace;">
          <h1 style="color: #dc2626; margin: 0 0 1rem;">Rip Error</h1>
          <pre style="background: #fef2f2; padding: 1rem; border-radius: 0.5rem; overflow: auto; color: #991b1b;">${escapeHtml(error.message)}</pre>
        </div>
      `;
    }
  }
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

// Run immediately (module is already deferred)
run();
