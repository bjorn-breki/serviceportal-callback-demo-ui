# ServiceProviderCallbackDemo — Mock Documents UI

## Stack

- Vite + React
- Axios for HTTP
- [Tailwind CSS](https://tailwindcss.com/) v4 for styling

## Prerequisites

- Node.js 20+ and npm
- Access to an X-Road security server that can reach the
  `serviceprovider-callback-api` and `serviceprovider-identity-api` services
- Valid OAuth2 client credentials issued by the Service Provider identity server
  (reached via X-Road)

## Getting started

### Environment variables

Copy `.env.template` and create `.env`

| Variable | Used by |
| -------- | ------- |
| `VITE_API_BASE_PATH` | Axios `baseURL` |
| `VITE_TOKEN_PATH` | Token request |
| `VITE_DEFAULT_SCOPE` | Default scope |
| `VITE_API_TARGET` | X-Road security server URL for the callback API |
| `VITE_AUTH_TARGET` | X-Road security server URL for the identity API |
| `VITE_XROAD_CLIENT` | X-Road consumer subsystem identifier (sent as `X-Road-Client` header) |
| `XROAD_CLIENT_CERT_PATH` | Path to the PFX client certificate used for X-Road TLS authentication |
| `XROAD_CLIENT_CERT_PASSPHRASE` | Passphrase for the PFX client certificate |

The certificate settings are optional and should be used if the security server requires a certificate

### Start aplication

```
npm install
npm run dev
```

The app will show a login screen supply `client_id`, `client_secret`

## Scripts

- `npm run dev` — start the Vite dev server with hot reload.
- `npm run build` — type-check and produce a production build in `dist/`.
- `npm run preview` — locally preview the production build.
- `npm run typecheck` — run `tsc --noEmit`.

## Notes on authentication

The login form uses the **OAuth2 `client_credentials` grant**. The token, the
scope the server actually issued, and its expiry is persisted to
`localStorage` so a page refresh doesn't force re-login until the
token expires. Any `401` response from the API automatically returns the user to the log-in screen.

# ! This UI is only intended for demo use only !
