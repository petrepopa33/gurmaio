# Remote-only / Cloud-only setup (Vercel + Cloudflare, no local)

Scop: totul în cloud, fără build/deploy local.

- **Frontend**: Vercel (Git integration)
- **Backend API**: Cloudflare Workers (Deploy from Git / Workers Builds)
- **DB/Auth**: Supabase

Nu trebuie să rulezi `npm install`, `npm run build` sau `wrangler deploy` local.

## 1) Frontend pe Vercel

1) Vercel → **Add New… → Project** → import repo-ul.
2) Framework: Vite (detectează automat).
3) Setează Environment Variables în Vercel (Project → Settings → Environment Variables):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_WORKERS_API_URL` (îl pui după ce ai URL-ul Worker-ului)

4) Deploy: Vercel va face build + deploy automat la fiecare push.

## 2) Backend API pe Cloudflare Workers (Deploy from Git)

În Cloudflare Dashboard → **Workers & Pages → Workers**:

1) Create → **Deploy from Git** (sau Workers Builds)
2) Conectează repo-ul (GitHub/GitLab) și alege:
   - Root / working directory: `packages/gurmaio-workers`
   - Config: folosește `wrangler.toml`

3) Setează secrets / vars în Cloudflare (Worker → Settings → Variables):

- `SUPABASE_URL` (secret)
- `SUPABASE_SERVICE_ROLE_KEY` (secret)
- `ALLOWED_ORIGINS` (opțional, recomandat) ex: `https://<proiectul-tau>.vercel.app`

4) Deploy: Cloudflare va face deploy automat la fiecare push.

## 3) Leagă Frontend ↔ API

După primul deploy al Worker-ului, ia URL-ul (ex: `https://<nume>.workers.dev`) și setează în Vercel:

- `VITE_WORKERS_API_URL` = URL-ul Worker-ului

Apoi redeploy (Vercel: “Redeploy” sau un nou push).

## Notițe

- În Worker se folosește Supabase **Service Role Key** (server-side only). Nu îl pune niciodată în Vercel env.
- În Vercel se pune doar `VITE_SUPABASE_ANON_KEY` (client-side).
- Dacă ai CORS probleme, setează `ALLOWED_ORIGINS` exact pe domeniul Vercel.
