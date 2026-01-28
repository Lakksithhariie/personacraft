import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const GROQ_CHAT_COMPLETIONS_URL = 'https://api.groq.com/openai/v1/chat/completions';

function groqProxyPlugin(mode: string): Plugin {
  // Load env files (including .env.local) on the SERVER side
  const env = loadEnv(mode, process.cwd(), '');

  // Prefer a server-only key name; allow VITE_* temporarily to ease migration
  const apiKey = env.GROQ_API_KEY || env.VITE_GROQ_API_KEY;

  async function handler(req: any, res: any, next: any) {
    if (req.url !== '/api/groq/chat') return next();

    // Optional: handle preflight
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: { message: 'method not allowed' } }));
      return;
    }

    if (!apiKey) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: {
            message:
              'groq api key missing on server. set GROQ_API_KEY in .env.local and restart the dev server.',
          },
        })
      );
      return;
    }

    // Read JSON body
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', async () => {
      try {
        const bodyText = Buffer.concat(chunks).toString('utf-8') || '{}';
        const payload = JSON.parse(bodyText);

        const upstream = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const text = await upstream.text();

        res.statusCode = upstream.status;
        res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
        res.end(text);
      } catch (e: any) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            error: { message: e?.message || 'proxy error' },
          })
        );
      }
    });
  }

  return {
    name: 'groq-proxy',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    // Vite 5+ supports preview middleware too; harmless if unused.
    configurePreviewServer(server) {
      server.middlewares.use(handler as any);
    },
  };
}

export default defineConfig(({ mode }) => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), groqProxyPlugin(mode)],

    // Keeps browser code that references process.env from crashing.
    define: {
      'process.env': {},
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});