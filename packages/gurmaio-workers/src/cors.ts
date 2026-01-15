export function getAllowedOrigins(env: { ALLOWED_ORIGINS?: string }): string[] | '*'{
  const raw = (env.ALLOWED_ORIGINS || '').trim();
  if (!raw || raw === '*') return '*';
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

export function corsHeaders(req: Request, env: { ALLOWED_ORIGINS?: string }) {
  const allowed = getAllowedOrigins(env);
  const origin = req.headers.get('Origin') || '';

  let allowOrigin = '*';
  if (allowed !== '*') {
    allowOrigin = allowed.includes(origin) ? origin : allowed[0] || '';
  }

  return {
    'Access-Control-Allow-Origin': allowOrigin || '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'authorization,content-type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  } as const;
}

export function withCors(req: Request, env: { ALLOWED_ORIGINS?: string }, res: Response) {
  const headers = new Headers(res.headers);
  const cors = corsHeaders(req, env);
  for (const [k, v] of Object.entries(cors)) headers.set(k, v);
  return new Response(res.body, { status: res.status, headers });
}
