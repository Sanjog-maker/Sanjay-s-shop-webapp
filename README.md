# ShopIQ — AI-Powered Retail Management for Local Grocery Stores

ShopIQ is a web application for helping small grocery and kirana-store owners manage billing, products, inventory, sales, and store insights from one interface.

## Project areas

The codebase is organized around billing and receipt workflows, a voice-based billing interface, product catalogue and inventory management, sales history and analytics, AI insights and copilot interface, and smart reorder, expiry-watch, profit-intelligence, and command-center views. Check the current implementation before describing any workflow as production-ready.

## Technology

- React, TypeScript, Vite
- Express with TypeScript
- Firebase / Cloud Firestore integration
- Google GenAI SDK for server-side AI integration
- Lucide icons and Motion UI

## Run locally

1. Install a supported Node.js version.
2. Install dependencies: `npm install`.
3. Copy `.env.example` to `.env`.
4. Add your own Gemini API key and app URL as server-side environment variables.
5. Add your own Firebase web configuration using the `VITE_FIREBASE_*` variables.
6. Run `npm run dev`.

Available scripts: `npm run build`, `npm run lint`, and `npm run start`.

## Security

- Never commit `.env`, service-account files, private keys, or API secrets.
- Firebase web configuration is client-side configuration. Restrict its API key in Google Cloud and use Firebase Authentication and suitable Firestore Security Rules.
- Firestore rules in this public copy deny access by default. Configure authenticated, store-scoped rules before connecting a Firebase project.
- Seeded customer names and phone numbers in this public copy have been anonymized.

## Deploy on Render

This repository includes a `render.yaml` Blueprint for a single Node.js web service in Render's Singapore region.

1. Sign in to Render and connect your GitHub account.
2. Choose **New → Blueprint** and select this repository.
3. Review the `shopiq-sanjay` service and choose the Free plan.
4. Deploy the Blueprint. Render will run `npm install && npm run build`, then `npm start`.
5. Confirm the service health check at `/api/health`.

The app includes deterministic fallback behaviour for core AI assistant and voice parsing flows when `GEMINI_API_KEY` is not configured. Add a Gemini API key only as a secret environment variable in Render if you want live Gemini-backed responses. Do not put the key in GitHub or any `VITE_*` variable.

**Demo limitations:** the current server-side store is in-memory, not a persistent production database. Data changes can reset when the service restarts or redeploys. The API is a portfolio/demo application and is not secured for real customer or payment data. Do not use it as a live retail system without authentication, authorization, persistent storage, and security review.

## Project status

This is a portfolio copy of the ShopIQ project. It is not a claim of production deployment, customer adoption, or measured business impact. Add only verified test results and reproducible measurements when documenting performance.

## License

No license is provided. Contact the repository owner before reusing this code.
