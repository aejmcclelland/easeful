# Easeful frontend

React 19, TypeScript, and Vite frontend for Easeful. The Express API lives in
`../easeful-server` and remains hosted separately on Render.

## Development

Use Node.js `24.10.0` and the repository's pnpm `10.20.0` declaration.
From this directory:

```bash
pnpm install --frozen-lockfile
cp .env.example .env
pnpm run dev
```

If `.env` already exists, review it instead of overwriting it. The example points
`VITE_API_URL` at `http://localhost:3000`; start the local API on port `3000`.
The frontend runs at `http://localhost:3001`, which the API's CORS policy allows.

`VITE_API_URL` must be an API origin without an `/api` suffix. Endpoint paths are
added by the client. An empty value uses same-origin `/api` requests through the
Vite development proxy to port `3000`. This development proxy does not run on
Cloudflare Pages; deployed builds need an explicit API origin. Keep credentials
out of `VITE_*` variables, which are exposed in the browser build.

## Checks and local build

```bash
pnpm run lint
pnpm run build
pnpm run preview
```

The build runs TypeScript checking and emits static files to `dist`. Preview
serves the compiled build; API access from its default origin is subject to the
backend's existing CORS policy. No automated test script is currently configured.

## Cloudflare Pages

- Root directory: `easeful-client`
- Build command: `pnpm run build`
- Output directory: `dist`
- `NODE_VERSION=24.10.0`
- `PNPM_VERSION=10.20.0`
- Production: `VITE_API_URL=https://api.easeful.amcclelland.net`

`easeful.amcclelland.net` is the frontend hostname; the API hostname remains the
Render backend. Deployment and DNS cutover are pending. See the
[deployment notes](../docs/deployment-notes.md) for SPA routing, preview-origin
limitations, and migration verification.
