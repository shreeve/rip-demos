/**
 * Development Server (Bun)
 * ------------------------
 * Simple static file server for no-build development
 *
 * Run: bun serve.ts
 */

const PORT = 3000;

Bun.serve({
    port: PORT,

    async fetch(req) {
        const url = new URL(req.url);
        let path = url.pathname;

        // Default to index.html for root
        if (path === '/') {
            path = '/index.html';
        }

        // Try to serve the file
        const file = Bun.file(`.${path}`);

        if (await file.exists()) {
            return new Response(file);
        }

        // SPA fallback - serve index.html for unmatched routes
        const index = Bun.file('./index.html');
        if (await index.exists()) {
            return new Response(index);
        }

        return new Response('Not Found', { status: 404 });
    },
});

console.log(`
🧪 Lab Demo Server

   Local:   http://localhost:${PORT}

   Press Ctrl+C to stop
`);
