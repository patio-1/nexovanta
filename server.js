const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const root = __dirname;
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

function loadEnvFile() {
  const envPath = path.join(root, '.env');
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || match[1] in process.env) continue;

    let value = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

function getSupabaseConfig() {
  const rawUrl = process.env.SUPABASE_URL || '';
  let url = '';

  if (rawUrl) {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') {
      throw new Error('SUPABASE_URL must use HTTPS, except for a localhost Supabase instance.');
    }
    url = parsed.origin;
  }

  return {
    url,
    anonKey: process.env.SUPABASE_ANON_KEY || '',
  };
}

function sendText(response, status, body) {
  response.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(body);
}

loadEnvFile();
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

const server = http.createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    sendText(response, 405, 'Method not allowed');
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    sendText(response, 400, 'Invalid request path');
    return;
  }

  if (pathname === '/supabase-config.js') {
    try {
      const config = getSupabaseConfig();
      response.writeHead(200, {
        'Cache-Control': 'no-store',
        'Content-Type': 'text/javascript; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      });
      response.end(request.method === 'HEAD' ? '' : `window.NEXOVANTA_SUPABASE_CONFIG = ${JSON.stringify(config)};\n`);
    } catch (error) {
      sendText(response, 500, error.message);
    }
    return;
  }

  const requestedPath = pathname === '/' ? 'index.html' : pathname.replace(/^[/\\]+/, '');
  let filePath = path.resolve(root, requestedPath);
  const relativePath = path.relative(root, filePath);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath) || relativePath.split(path.sep).some(part => part.startsWith('.'))) {
    sendText(response, 404, 'Not found');
    return;
  }

  try {
    let fileInfo = await fs.promises.stat(filePath);
    if (fileInfo.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      fileInfo = await fs.promises.stat(filePath);
    }
    if (!fileInfo.isFile()) {
      sendText(response, 404, 'Not found');
      return;
    }

    response.writeHead(200, {
      'Cache-Control': 'no-cache',
      'Content-Length': fileInfo.size,
      'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
    });
    if (request.method === 'HEAD') {
      response.end();
      return;
    }
    fs.createReadStream(filePath).pipe(response);
  } catch {
    sendText(response, 404, 'Not found');
  }
});

server.listen(port, host, () => {
  console.log(`Nexovanta is listening on ${host}:${port}`);
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.warn('Supabase Auth is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env.');
  }
});