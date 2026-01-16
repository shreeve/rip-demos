/**
 * Development Server (Bun)
 * ------------------------
 * Serves raw Rip files for browser-side compilation
 *
 * Run: bun serve.ts
 */

const PORT = 3001;

const MIME_TYPES: Record<string, string> = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.rip': 'text/plain',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
};

function getMimeType(path: string): string {
    const ext = path.substring(path.lastIndexOf('.'));
    return MIME_TYPES[ext] || 'application/octet-stream';
}

Bun.serve({
    port: PORT,

    async fetch(req) {
        const url = new URL(req.url);
        let path = url.pathname;

        // Default to index.html for root
        if (path === '/') {
            path = '/index.html';
        }

        // Serve files
        const file = Bun.file(`.${path}`);
        if (await file.exists()) {
            return new Response(file, {
                headers: {
                    'Content-Type': getMimeType(path),
                },
            });
        }

        // SPA fallback
        const index = Bun.file('./index.html');
        if (await index.exists()) {
            return new Response(index, {
                headers: { 'Content-Type': 'text/html' },
            });
        }

        return new Response('Not Found', { status: 404 });
    },
});

console.log(`
🧪 Lab Orders (Rip Edition)

   Local:   http://localhost:${PORT}

   Serving raw .rip files (browser compiles them)

   Press Ctrl+C to stop
`);
