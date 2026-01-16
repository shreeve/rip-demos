# Rip Browser Loader

A zero-build, declarative runtime for loading and executing Rip applications in the browser.

## The Primitive

```html
<script type="module" src="/rip.js" rip="/app.rip"></script>
```

One line. That's it.

- `src="/rip.js"` — loads the Rip runtime
- `rip="/app.rip"` — tells Rip what to run

This mirrors how every other asset works on the web:

| Asset Type | Loader | Payload |
|------------|--------|---------|
| `<img>` | browser | image bytes |
| `<link rel="stylesheet">` | browser | CSS |
| `<script src>` | browser | JavaScript |
| **Rip** | browser → `rip.js` | **Rip source** |

Rip becomes just another asset type — not a build step, not a framework, not a toolchain.

---

## How It Works

### Load Sequence

```
Browser                          Server
   │                               │
   │──── GET /rip.js ─────────────▶│
   │◀─── rip.js (runtime) ─────────│
   │                               │
   │  rip.js reads rip="/app.rip"  │
   │                               │
   │──── GET /app.rip ────────────▶│
   │◀─── raw Rip source ───────────│
   │                               │
   │  compileToJS(source)          │
   │  execute via blob import      │
   │                               │
   ▼  App renders to DOM           │
```

### Step by Step

1. **Browser loads `/rip.js`** as an ES module
2. **`rip.js` finds itself** via `document.querySelector('script[src*="rip.js"][rip]')`
3. **Reads attributes** — `rip`, `rip-deps`, `rip-target`, etc.
4. **Fetches `.rip` files** — raw source, served as `text/plain`
5. **Compiles to JavaScript** — via `compileToJS()` from `rip.browser.js`
6. **Executes** — combined JS runs via blob URL dynamic import
7. **App mounts** — reactive DOM renders to target

### Why Blob Import?

```javascript
const blob = new Blob([compiledJs], { type: 'application/javascript' });
const url = URL.createObjectURL(blob);
await import(url);
URL.revokeObjectURL(url);
```

This approach:
- Preserves ES module semantics
- Allows `import`/`export` in compiled output
- Keeps code in proper JavaScript context
- Works with browser devtools
- No `eval()` needed for module code

---

## Attributes

### Required

| Attribute | Description |
|-----------|-------------|
| `rip="/path/to/app.rip"` | Entry file to load and run |

Alternative: `rip-src="/path/to/app.rip"` (longer form)

### Optional

| Attribute | Description | Default |
|-----------|-------------|---------|
| `rip-deps="/a.rip,/b.rip"` | Comma-separated dependencies to load first | none |
| `rip-target="#app"` | Mount target selector | `#app` |

### Examples

**Minimal:**
```html
<script type="module" src="/rip.js" rip="/app.rip"></script>
```

**With dependencies:**
```html
<script type="module" src="/rip.js"
  rip="/app.rip"
  rip-deps="/data/models.rip,/lib/utils.rip">
</script>
```

**Full form:**
```html
<script type="module" src="/rip.js"
  rip-src="/app.rip"
  rip-deps="/data.rip"
  rip-target="#root">
</script>
```

---

## File Structure

A typical Rip browser app:

```
my-app/
├── index.html          # HTML shell with <script> tag
├── rip.js              # Loader (this file)
├── rip.browser.js      # Compiler/runtime
├── app.rip             # Entry point
├── data/
│   └── models.rip      # Data/dependencies
└── css/
    └── styles.css      # Styles (Tailwind, etc.)
```

### index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Rip App</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
    <div id="app"></div>
    <script type="module" src="/rip.js" rip="/app.rip" rip-deps="/data/models.rip"></script>
</body>
</html>
```

### Server Requirements

The server must:
1. Serve `.rip` files as `text/plain` (or any text MIME type)
2. Serve `.js` files as `application/javascript`
3. No compilation needed — browser handles everything

Minimal Bun server:

```typescript
Bun.serve({
    port: 3000,
    async fetch(req) {
        const url = new URL(req.url);
        const file = Bun.file(`.${url.pathname === '/' ? '/index.html' : url.pathname}`);
        return await file.exists() ? new Response(file) : new Response('Not Found', { status: 404 });
    }
});
```

---

## Dependency Loading

Dependencies listed in `rip-deps` are:
- Loaded **in order** (left to right)
- Compiled **separately**
- Combined into **one module** with the entry file
- Executed **together**

This means variables/functions defined in dependencies are available to the entry file:

**data.rip:**
```coffee
users = [
  { id: 1, name: 'Alice' }
  { id: 2, name: 'Bob' }
]

def findUser(id)
  users.find (u) -> u.id is id
```

**app.rip:**
```coffee
component App
  render
    div
      for user in users
        p user.name

App.new().mount "#app"
```

```html
<script type="module" src="/rip.js" rip="/app.rip" rip-deps="/data.rip"></script>
```

The compiled output is:
```javascript
// From data.rip
let users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
function findUser(id) { return users.find(u => u.id === id); }

// From app.rip
class App { ... }
new App().mount("#app");
```

---

## Error Handling

When compilation or loading fails:

1. Error is logged to console: `Rip: [error message]`
2. Error UI is rendered to the target element:

```
┌─────────────────────────────────────┐
│ Rip Error                           │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Compilation error in /app.rip:  │ │
│ │ unexpected token at line 42     │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

This provides immediate feedback during development.

---

## Future Extensions

The `rip` attribute namespace is reserved for future features:

```html
<script type="module" src="/rip.js"
  rip="/app.rip"
  rip-deps="/data.rip"
  rip-target="#app"
  rip-mode="dev"
  rip-hmr
  rip-cache="persistent"
  rip-sourcemap
>
</script>
```

### Planned Attributes

| Attribute | Purpose |
|-----------|---------|
| `rip-mode="dev\|prod"` | Development vs production mode |
| `rip-hmr` | Enable hot module replacement |
| `rip-cache="memory\|persistent\|none"` | Compilation caching strategy |
| `rip-sourcemap` | Generate source maps for debugging |
| `rip-importmap` | Custom module resolution |
| `rip-root="/src"` | Base path for relative imports |

### Multi-App Support

Multiple Rip apps on one page:

```html
<script type="module" src="/rip.js" rip="/header.rip" rip-target="#header"></script>
<script type="module" src="/rip.js" rip="/main.rip" rip-target="#main"></script>
<script type="module" src="/rip.js" rip="/footer.rip" rip-target="#footer"></script>
```

Each loader instance is isolated and targets its own container.

---

## Why This Architecture?

### 1. Declarative, Not Imperative

No inline JavaScript. No boot code. No configuration files.

```html
<!-- This is all you need -->
<script type="module" src="/rip.js" rip="/app.rip"></script>
```

The HTML says: "This page runs Rip, and *this* is the entry file."

### 2. Zero Build Step

- No Webpack
- No Vite
- No bundler
- No watcher
- No npm scripts

Edit `.rip` files → Refresh browser → See changes.

### 3. Runtime is Stable

`rip.js` and `rip.browser.js` are static assets that:
- Can be cached aggressively
- Can be served from CDN
- Never change during development
- Are the same in dev and prod

### 4. Perfect Symmetry with CLI

In the terminal:
```bash
bun rip app.rip
```

In the browser:
```html
<script src="/rip.js" rip="/app.rip"></script>
```

Same mental model. Same entry file. Same semantics.

### 5. HTML is the Config

No `rip.config.js`. No `package.json` scripts. No `.env` files.

Configuration lives in HTML attributes — visible, declarative, versionable.

---

## Implementation Details

### Finding the Script Element

ES modules don't have `document.currentScript`, so we query:

```javascript
const scriptEl = document.querySelector('script[src*="rip.js"][rip]')
              || document.querySelector('script[src*="rip.js"][rip-src]');
```

This finds `<script>` tags that:
1. Have `src` containing `rip.js`
2. Have a `rip` or `rip-src` attribute

### URL Resolution

Paths are resolved relative to the document:

```javascript
function resolveUrl(path) {
  return new URL(path, document.baseURI).href;
}
```

So `rip="/app.rip"` becomes `http://localhost:3000/app.rip`.

### Module Execution

Compiled JavaScript is executed as a proper ES module:

```javascript
const blob = new Blob([combined], { type: 'application/javascript' });
const url = URL.createObjectURL(blob);
await import(url);
URL.revokeObjectURL(url);
```

This preserves:
- ES module scoping
- Top-level `await`
- `import`/`export` statements
- Strict mode

---

## Comparison

### Traditional SPA (Vite/Webpack)

```
Source → Bundler → Bundle.js → Browser
         ↑
    Build step required
```

### Rip Browser

```
Source → Browser → Compile → Execute
              ↑
         No build step
```

| Aspect | Traditional | Rip |
|--------|-------------|-----|
| Build step | Required | None |
| Dev server | Complex | Simple static |
| Hot reload | Tooling dependent | Refresh |
| Deploy | Build artifacts | Source files |
| Debug | Source maps | Direct source |

---

## Security Notes

- Rip source is fetched via `fetch()` — same-origin policy applies
- Compiled code runs via blob URL — same security context as inline script
- No `eval()` of user input — only pre-authored `.rip` files
- CSP: requires `blob:` in `script-src` for blob URL imports

---

## Browser Support

Requires:
- ES modules (`type="module"`)
- Dynamic `import()`
- `URL.createObjectURL()`
- `fetch()` API

Supported in all modern browsers (Chrome 63+, Firefox 67+, Safari 11.1+, Edge 79+).

---

## Quick Start

1. Copy `rip.js` and `rip.browser.js` to your project
2. Create `index.html`:

```html
<!DOCTYPE html>
<html>
<head><title>My App</title></head>
<body>
    <div id="app"></div>
    <script type="module" src="/rip.js" rip="/app.rip"></script>
</body>
</html>
```

3. Create `app.rip`:

```coffee
component App
  count := 0

  render
    div
      h1 "Count: #{count}"
      button @click: -> count++
        "Increment"

App.new().mount "#app"
```

4. Serve with any static server
5. Open in browser

That's it. No installation. No configuration. Just Rip.
