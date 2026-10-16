module.exports = function supabaseConfig(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    response.status(405).end('Method not allowed');
    return;
  }

  const rawUrl = process.env.SUPABASE_URL || '';
  let url = '';

  try {
    if (rawUrl) {
      const parsed = new URL(rawUrl);
      if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') {
        throw new Error('SUPABASE_URL must use HTTPS, except for a localhost Supabase instance.');
      }
      url = parsed.origin;
    }
  } catch (error) {
    response.status(500).setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.end(error.message);
    return;
  }

  const config = {
    url,
    anonKey: process.env.SUPABASE_ANON_KEY || '',
  };
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Content-Type', 'text/javascript; charset=utf-8');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.status(200).end(
    request.method === 'HEAD'
      ? ''
      : `window.NEXOVANTA_SUPABASE_CONFIG = ${JSON.stringify(config)};\n`
  );
};
