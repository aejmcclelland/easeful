# Easeful – Task Management Application

Easeful is a task management application built with React 19, Vite, TypeScript,
Express, and MongoDB Atlas. It supports account registration, cookie-based
sessions, task status and priority updates, profiles, and image uploads.

## Hosting and architecture

The frontend is prepared for migration to Cloudflare Pages; deployment and DNS
cutover are pending.

- `https://easeful.amcclelland.net` is the frontend hostname, targeting Cloudflare Pages.
- `https://api.easeful.amcclelland.net` remains the Express API on Render.
- MongoDB Atlas stores application data and sessions; Cloudinary handles uploads.

The project previously used AWS S3 and CloudFront, with Terraform configuration
for frontend infrastructure. That configuration has been retired from this branch.
The migration retains this AWS infrastructure experience as project history.

See [deployment notes](docs/deployment-notes.md) for Cloudflare Pages configuration,
remaining manual cleanup, and cutover checks.

## Local development

Use Node.js `24.10.0` and pnpm `10.20.0`, as declared by the project.

```bash
cd easeful-client
pnpm install --frozen-lockfile
cp .env.example .env
pnpm run dev
```

The frontend runs at `http://localhost:3001`. If `.env` already exists, review it
instead of overwriting it. `VITE_API_URL` selects the API origin; see the
[client README](easeful-client/README.md) for local configuration and checks.

The API runs separately:

```bash
cd easeful-server
pnpm install --frozen-lockfile
pnpm run dev
```

Configure the backend's private `.env` with its required service credentials and
`PORT=3000` to match the client example. Keep backend credentials out of the
frontend environment. Backend configuration is maintained separately from Pages.

`easeful-server/data/users.json` is disposable input for the optional database
seeder, not runtime application data. Its passwords are deliberately fake
placeholders and must never be used as production credentials. The seeder is not
part of frontend build or deployment; use it only with a disposable local database.

## Project structure

- `easeful-client/`: React frontend, Tailwind CSS, DaisyUI, and React Router.
- `easeful-server/`: Express API, authentication, persistence, and uploads.
- `docs/deployment-notes.md`: Pages setup and migration checks.
- `easeful-roadmap.md`: proposed product features.

## Author

Andrew McClelland
[Portfolio](https://amcclelland.net) · [GitHub](https://github.com/andrewmcclelland)
