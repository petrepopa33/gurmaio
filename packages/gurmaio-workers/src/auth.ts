import { createRemoteJWKSet, jwtVerify } from 'jose';

export type AuthEnv = {
  SUPABASE_URL: string;
};

type Verified = {
  userId: string;
};

function ensureEnv(env: Partial<AuthEnv>): asserts env is AuthEnv {
  if (!env.SUPABASE_URL) throw new Error('Missing SUPABASE_URL');
}

function bearerToken(req: Request) {
  const h = req.headers.get('Authorization') || req.headers.get('authorization') || '';
  const m = /^Bearer\s+(.+)$/i.exec(h);
  return m?.[1] || null;
}

export async function verifySupabaseJwt(req: Request, envLike: Partial<AuthEnv>): Promise<Verified> {
  ensureEnv(envLike);
  const env = envLike;

  const token = bearerToken(req);
  if (!token) throw new Error('Missing Authorization bearer token');

  const supabaseUrl = env.SUPABASE_URL.replace(/\/$/, '');
  const jwksUrl = new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`);
  const jwks = createRemoteJWKSet(jwksUrl);

  const issuer = `${supabaseUrl}/auth/v1`;

  const { payload } = await jwtVerify(token, jwks, {
    issuer,
    audience: 'authenticated',
  });

  const userId = typeof payload.sub === 'string' ? payload.sub : '';
  if (!userId) throw new Error('Invalid token (missing sub)');

  return { userId };
}
