# Burning Well Backend

Backend for the Burning Well burn registry, global statistics, user history, referral attribution, and admin analytics.

## Environment

Copy `.env.example` to `.env` and set:

- `ANKR_RPC_URL` — the NEW Ankr Solana RPC endpoint/API key. Keep this server-side only.
- `FEE_WALLET` — Burning Well service-fee wallet.
- `ADMIN_API_KEY` — long random value for the admin portal.
- `FIREBASE_SERVICE_ACCOUNT_JSON` — Firebase Admin service-account JSON as one environment variable.

The referral reward is paid atomically by the burner's wallet during the burn transaction, so there is no backend payout private key.

## Run

From `backend/`:

```bash
npm install
npm start
```

The Vite development server proxies `/api` to `http://localhost:8787`.

For production, build the frontend from the project root with `npm run build`, then run the backend. The backend serves the generated `dist/` folder.

## Firestore

The backend creates these collections automatically:

- `burn_registry`
- `referral_codes`
- `fee_quotes`
- `referral_rewards`

A verified burn is keyed by its Solana transaction signature, preventing duplicate registry records.

## Admin

Open `/admin.html` and enter the `ADMIN_API_KEY` value. The admin API is protected by the `x-admin-key` header.
