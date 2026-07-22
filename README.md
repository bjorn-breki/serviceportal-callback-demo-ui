# ServiceProviderCallbackDemo — Mock Documents UI

| Method | Path | Action |
| ------ | ---- | ------ |
| `POST` | `/api/v1/documents` | Create a mock document |
| `GET` | `/api/v1/documents` | List all mock documents for credentials |
| `DELETE` | `/api/v1/documents/{id}` | Delete a mock document |

## Stack

- Vite + React
- Axios for HTTP
- [Tailwind CSS](https://tailwindcss.com/) v4 for styling

## Prerequisites

- Node.js 20+ and npm
- The callback API running locally (default `http://localhost:5184`,
  see `apps/serviceprovider-callback-api/Properties/launchSettings.json` → `http` profile)
- Valid OAuth2 client credentials issued by the Service Provider identity server
  (`https://serviceprovider-identity-api.staging.tr.is` by default)

## Getting started

```
npm install
npm run dev
```

The app will show a login screen supply `client_id`, `client_secret`

## Environment variables

Copy `.env.template` and create `.env`

| Variable | Default | Used by |
| -------- | ------- | ------- |
| `VITE_API_BASE_PATH` | Axios `baseURL` |
| `VITE_TOKEN_PATH` | Token request |
| `VITE_DEFAULT_SCOPE` | Default scope |
| `VITE_API_TARGET` | Path for API |
| `VITE_AUTH_TARGET` | Path for auth API |

## Scripts

- `npm run dev` — start the Vite dev server with hot reload.
- `npm run build` — type-check and produce a production build in `dist/`.
- `npm run preview` — locally preview the production build.
- `npm run typecheck` — run `tsc --noEmit`.

## Notes on the OAuth flow

The login form uses the **OAuth2 `client_credentials` grant**. The token, the
scope the server actually issued, and its expiry is persisted to
`localStorage` so a page refresh doesn't force re-login until the
token expires. Any `401` response from the API automatically clears the stored
auth and bounces the user back to the login screen.

> ! This UI is only intended for demo use against staging. !