# Skylar Desk — Proposal & Quotation Builder

An offline-first static Progressive Web App for creating **Proposals, Quotations, Invoices, and Purchase Orders**.

## Current features
- Editable sender and client information
- Multiple line items with quantity, unit, duration, rate, and calculated amount
- USD, PHP, AUD, EUR, GBP, and SGD display currencies
- Automatic subtotal, percentage discount, tax, and grand-total calculations
- Scope, payment terms, schedule, inclusions, exclusions, notes, signatory and status fields
- Save, search, open, duplicate, and delete drafts in browser local storage
- Print / Save PDF using the browser print dialog
- JSON backup export/import
- PWA manifest and service worker for offline app-shell caching
- Sample Skylar Education Asia quotation based on the provided SE-2026-008 document

## Run locally
This is a static application. Serve the repository root with any static HTTP server, for example:

```bash
python -m http.server 3000
```

Then open http://localhost:3000.

## Data and offline behavior
Drafts and company profile are stored in this browser's local storage. Export a JSON backup regularly. Offline caching is provided by the service worker after the first successful load over HTTPS or localhost.

**Cloud sync and user authentication are not configured in this initial release.** Online availability means the app can be opened from its hosted URL; cross-device synchronization requires a separately configured backend and authentication provider.

## Deployment
Designed for static hosting on Vercel. The repository can be connected to a Vercel project for automatic deployments on pushes to `main`.


## Gmail proposal email drafts

Skylar Desk can prepare a Gmail draft with the generated proposal PDF attached. It uses Google Identity Services in the browser and the Gmail API `gmail.compose` scope; it does not store Google access tokens or client secrets.

1. In Google Cloud Console, enable the Gmail API and configure the OAuth consent screen.
2. Create an OAuth 2.0 **Web application** client ID.
3. Add the deployed site origin (for example, `https://desk.skylarasia.com`) under Authorized JavaScript origins.
4. In Skylar Desk → Company settings, enter the OAuth client ID and save.
5. Open a proposal, enter the client's email, then choose **Email PDF** and approve the Google authorization prompt.
6. Review the resulting Gmail draft and its PDF attachment before sending.

The OAuth client ID is public browser configuration, not a client secret. Google may require consent-screen publishing or test-user configuration depending on the OAuth app's status. PDF generation loads html2pdf.js from a CDN and therefore requires an internet connection for this feature; the rest of the offline-first app remains available.


## Authentication and route protection

- Passwordless Supabase email-link sign-in with PKCE is provided at `/login.html`.
- Vercel Routing Middleware protects `/` and `/index.html` by verifying the signed-in user's access token with Supabase Auth and checking the confirmed allowlisted email.
- The browser uses only the Supabase publishable key. The Supabase secret key is required only by the server-side social integration API and must never be exposed to the browser.
- The static app stores quotation drafts in browser local storage. The route guard protects the app entry page, not every static asset; use authenticated server APIs and RLS for confidential cloud records.
- Before production use, configure the Supabase Auth Site URL and redirect URLs in `SOCIAL_INTEGRATIONS_SETUP.md`, create/confirm the allowlisted operator account, and configure the rotated server-only secret key in Vercel.

## Social platform integrations

The social dashboard now includes a server-side OAuth/API scaffold for Facebook, Instagram, LinkedIn, Google Business Profile and GA4. It uses Supabase Auth for operator sign-in, allowlisted admin email checks, RLS-protected integration tables and server-side AES-256-GCM encryption for OAuth tokens. No provider is shown as connected until OAuth succeeds.

Setup instructions: [SOCIAL_INTEGRATIONS_SETUP.md](SOCIAL_INTEGRATIONS_SETUP.md). Apply the SQL migration in supabase/migrations/ and configure the required secrets in Vercel before attempting provider authorization. Provider approvals and API access are controlled by Meta, LinkedIn and Google; code deployment alone does not grant those permissions.