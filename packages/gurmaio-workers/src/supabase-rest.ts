export type SupabaseEnv = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
};

function ensureEnv(env: Partial<SupabaseEnv>): asserts env is SupabaseEnv {
  if (!env.SUPABASE_URL) throw new Error('Missing SUPABASE_URL');
  if (!env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
}

function restUrl(env: SupabaseEnv, path: string) {
  return `${env.SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${path.replace(/^\//, '')}`;
}

export async function supabaseSelectSingle<T>(
  envLike: Partial<SupabaseEnv>,
  table: string,
  query: Record<string, string>,
  select = '*'
): Promise<T | null> {
  ensureEnv(envLike);
  const env = envLike;

  const url = new URL(restUrl(env, table));
  url.searchParams.set('select', select);
  for (const [k, v] of Object.entries(query)) {
    url.searchParams.set(k, `eq.${v}`);
  }

  const res = await fetch(url.toString(), {
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      Accept: 'application/json',
    },
  });

  if (res.status === 406 || res.status === 404) return null;
  if (!res.ok) throw new Error(`Supabase select failed (${res.status}): ${await res.text()}`);

  const rows = (await res.json()) as T[];
  return rows[0] ?? null;
}

export async function supabaseSelectMany<T>(
  envLike: Partial<SupabaseEnv>,
  table: string,
  query: Record<string, string>,
  select = '*',
  options?: {
    order?: { column: string; ascending?: boolean };
    limit?: number;
  }
): Promise<T[]> {
  ensureEnv(envLike);
  const env = envLike;

  const url = new URL(restUrl(env, table));
  url.searchParams.set('select', select);
  for (const [k, v] of Object.entries(query)) {
    url.searchParams.set(k, `eq.${v}`);
  }
  if (options?.order?.column) {
    url.searchParams.set(
      'order',
      `${options.order.column}.${options.order.ascending === false ? 'desc' : 'asc'}`
    );
  }
  if (typeof options?.limit === 'number') {
    url.searchParams.set('limit', String(options.limit));
  }

  const res = await fetch(url.toString(), {
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      Accept: 'application/json',
    },
  });

  if (res.status === 406 || res.status === 404) return [];
  if (!res.ok) throw new Error(`Supabase select failed (${res.status}): ${await res.text()}`);

  return (await res.json()) as T[];
}

export async function supabaseDelete(
  envLike: Partial<SupabaseEnv>,
  table: string,
  query: Record<string, string>
) {
  ensureEnv(envLike);
  const env = envLike;

  const url = new URL(restUrl(env, table));
  for (const [k, v] of Object.entries(query)) {
    url.searchParams.set(k, `eq.${v}`);
  }

  const res = await fetch(url.toString(), {
    method: 'DELETE',
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      Accept: 'application/json',
      Prefer: 'return=representation',
    },
  });

  if (!res.ok) throw new Error(`Supabase delete failed (${res.status}): ${await res.text()}`);
  return res.json();
}

export async function supabaseUpsert(
  envLike: Partial<SupabaseEnv>,
  table: string,
  row: Record<string, unknown>,
  onConflict?: string
) {
  ensureEnv(envLike);
  const env = envLike;

  const url = new URL(restUrl(env, table));
  if (onConflict) url.searchParams.set('on_conflict', onConflict);

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(row),
  });

  if (!res.ok) throw new Error(`Supabase upsert failed (${res.status}): ${await res.text()}`);
  return res.json();
}
