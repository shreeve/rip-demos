# Lab Orders (Rip Edition)

A lab test ordering application written entirely in **Rip** — running client-side in the browser.

## Architecture

Unlike traditional SPAs that are bundled with Vite/Webpack, this app:

1. **Browser loads Rip runtime** from `rip.browser.min.js`
2. **Server sends raw `.rip` files** as plain text
3. **Browser compiles and executes** the Rip code on-the-fly

This means zero build step during development — just edit `.rip` files and refresh!

## Running

```bash
cd lab
bun serve.ts
```

Then open http://localhost:3001

## File Structure

```
lab/
├── index.html              # Entry point - loads Rip browser runtime
├── serve.ts                # Bun development server
├── app.rip                 # Main Rip application component
├── data/
│   └── medical-tests.rip   # Test catalog data & helpers
└── css/
    ├── base.css            # Design tokens & resets
    └── components.css      # Component styles
```

## Rip Features Used

- **Reactive signals** (`:=`) - `searchTerm`, `selectedTests`
- **Derived values** (`~=`) - `filteredTests`, `totals`
- **Components** - with `mounted`, `updated` lifecycle
- **Event handlers** - `@click: @method`, `@input: @handleSearch`
- **Dynamic classes** - `.("selected" if condition)`
- **Loops with keys** - `for test in filteredTests, key: test.id`
- **Attributes** - `data-lucide: "search"`, `type: "text"`
- **String interpolation** - `"#{count} items"`

## Key Syntax Examples

```coffee
# Component with reactive state
component App
  count := 0                          # Signal
  doubled ~= count * 2                # Derived

  increment: -> count += 1            # Method

  render
    .card                             # Implicit div
      span "Count: #{count}"          # Interpolation
      button @click: @increment, "+"  # Event handler
```
