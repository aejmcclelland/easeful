# Easeful deployment notes

## Migration status

The frontend is prepared for Cloudflare Pages. This repository cleanup does not
create a Pages project, deploy the application, or change DNS, Render, or AWS.

`easeful.amcclelland.net` is the frontend hostname.
`api.easeful.amcclelland.net` remains the existing Render backend.

Previously, the static frontend used AWS S3 and CloudFront, with Terraform
configuration for frontend provisioning. That configuration is retired from this
branch. The former AWS deployment is historical project experience, not an active
deployment path.

## Cloudflare Pages settings

Use the React/Vite preset with these explicit settings:

| Setting | Value |
| --- | --- |
| Root directory | `easeful-client` |
| Build command | `pnpm run build` |
| Output directory | `dist` |
| Node version / `NODE_VERSION` | `24.10.0` |
| pnpm version / `PNPM_VERSION` | `10.20.0` |
| Production environment variable | `VITE_API_URL=https://api.easeful.amcclelland.net` |
| Frontend custom domain | `easeful.amcclelland.net` |

Keep the existing root `package.json` pnpm package-manager declaration. The client
`engines.node` declaration pins the runtime; explicitly configure `NODE_VERSION`
and `PNPM_VERSION` in Pages so the build environment matches local verification.
Build from `easeful-client`, not the repository root. Publish only its `dist`
output, never the repository or backend directory.

`VITE_API_URL` is a public API origin without an `/api` suffix. The frontend adds
endpoint paths itself. Vite embeds the variable at build time, so changing it
requires a rebuild. The ignored local `.env` file is not supplied by Git-based
Pages builds. Configure the variable in Pages before building; without it,
requests fall back to the frontend origin. Never put credentials in `VITE_*`
variables or copy the backend environment into Pages.

The backend, database, sessions, email, and upload credentials remain on Render
and their existing services. No Pages Functions or Workers are required.

## Routing, previews, and authentication

The application uses `BrowserRouter`. Pages provides SPA fallback when there is
no top-level `404.html`; keep the current output free of that file. No redirect
file is required. Check direct navigation and refreshes for `/login`, `/register`,
`/tasks`, and `/profile` after deployment.

The API currently allows `http://localhost:3001` and
`https://easeful.amcclelland.net` through its CORS allowlist. A `pages.dev` URL is
not permitted, so authenticated API calls from that URL are not expected to work.
Do not broaden the allowlist to wildcard preview domains. Any future preview
origin policy must be reviewed separately, including the API URL used by previews.

Production cookies are issued by the API with `HttpOnly`, `Secure`, and
`SameSite=None`. Keeping the frontend and API under `amcclelland.net` preserves
their same-site relationship. Validate authentication on the custom domain;
`pages.dev` testing also introduces browser third-party-cookie restrictions.

## Remaining manual cleanup and cutover

Both CloudFront distributions, both Easeful S3 buckets, and the CloudFront
flat-rate plan were removed manually. No Easeful ACM certificate remains, as
reported during the migration audit.

The following ignored local artifacts are intentionally retained:

- `infra/terraform.tfstate`
- `infra/terraform.tfvars`
- `infra/.terraform/`

Confirm that the Easeful CloudFront Origin Access Control is gone before removing
these artifacts manually. Keep state and real variable files private. Check for
unused Easeful-specific deployment credentials or integrations separately. The
retired configuration/state described one bucket/distribution pair, so it does
not establish complete cleanup of the second manually created pair.

When ready to cut over, associate `easeful.amcclelland.net` with the Pages project
before updating the frontend DNS record to its assigned Pages target. Preserve
`api.easeful.amcclelland.net` and other existing DNS records. Verify custom-domain
TLS, then login, session persistence, logout, task operations, uploads, direct
routes, and static assets. None of these external steps is performed by this
repository cleanup.

## Local verification

From `easeful-client`, using the pinned Node and pnpm versions:

```bash
pnpm run lint
pnpm run build
pnpm run preview
```

The build includes TypeScript checking and writes `dist`. Set the intended public
API origin before building. The repository currently has no automated test script;
production authentication and DNS/TLS require separate post-deployment checks.

References: [Pages build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/),
[build tools](https://developers.cloudflare.com/pages/configuration/build-image/),
[SPA serving](https://developers.cloudflare.com/pages/configuration/serving-pages/),
[custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/),
and [Vite environment variables](https://vite.dev/guide/env-and-mode).
