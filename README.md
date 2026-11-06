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
