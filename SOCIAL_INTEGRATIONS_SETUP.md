# Skylar SalesDesk social integrations

## Security architecture
- Vercel serverless endpoint: /api/social?op=...
- Supabase Auth email OTP authenticates the operator; only verified emails in SOCIAL_ADMIN_EMAILS are authorized.
- OAuth tokens are encrypted server-side with AES-256-GCM before storage. The encryption key stays in Vercel, separate from Supabase.
- RLS is enabled on integration tables with no anon/authenticated policies. Never expose the Supabase service-role/secret key or provider secrets in browser code, localStorage, or GitHub.
- OAuth state is HMAC-signed and expires after 10 minutes. No provider secret is returned by the public config endpoint.

## Supabase setup
1. Select project `xyzlfloiymobaixvlhjw`.
2. In Project Settings > API Keys, use the publishable key for browser auth. Rotate any secret key that has been pasted into chat, source code, screenshots, or other shared locations before adding the replacement to Vercel.
3. In Authentication > URL Configuration, set Site URL to `https://skylar-salesdesk.vercel.app` and add `https://skylar-salesdesk.vercel.app/` and `https://skylar-salesdesk.vercel.app/login.html` to the allowed redirect URLs. Add your exact local development origin only if needed.
4. In Authentication > Providers, enable Email. Keep user sign-ups disabled for this invite-only operator app. Create/invite `junrey@skylarasia.com` as an Auth user and confirm its email.
5. The existing static HTML app now displays a passwordless PKCE email-link gate. The browser uses only `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`; the social API independently validates the bearer token with `/auth/v1/user` and checks the allowlisted, confirmed email.
6. The social API also needs `SUPABASE_SECRET_KEY` in Vercel (server-only) to access the RLS-protected integration tables. The key shown in the previous setup conversation must be rotated before use.
7. The social integration migration and the `rls_auto_enable()` privilege restriction have been applied through Supabase. The migration file remains in `supabase/migrations/` for source control.

**Route protection:** Vercel Routing Middleware now guards `/` and `/index.html` before the static page is served. It verifies the `skylar_access_token` cookie against Supabase Auth and checks the confirmed, allowlisted email. `/login.html` and the public config endpoint remain reachable so an operator can sign in; the social API separately validates bearer tokens. The cookie is JavaScript-readable because this remains a static browser app, and non-page static assets (for example the logo and service worker) remain public. Do not store confidential business records in static assets. For sensitive multi-user document data, move persistence behind authenticated server endpoints/RLS and adopt server-managed HttpOnly sessions.

## Vercel environment
Add all variables in .env.example to Vercel > skylar-salesdesk > Settings > Environment Variables (Production). Set SOCIAL_ADMIN_EMAILS=junrey@skylarasia.com and SOCIAL_BASE_URL=https://skylar-salesdesk.vercel.app. Generate SOCIAL_STATE_SECRET and SOCIAL_TOKEN_ENCRYPTION_KEY independently using:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
Set the encryption key to a separate generated value; it must decode to exactly 32 bytes. Redeploy after configuration.

## Provider app setup
Use this exact OAuth redirect URI in each provider app:
https://skylar-salesdesk.vercel.app/api/social?op=callback

### Meta / Facebook / Instagram
Create an app at https://developers.facebook.com/apps/. Add Facebook Login and the relevant Page/Instagram products. Configure the redirect URI, then set META_APP_ID and META_APP_SECRET in Vercel. Review and business verification may be required. Instagram Insights requires an Instagram Professional account linked to an accessible Facebook Page and approved permissions.

### LinkedIn
Create an app at https://www.linkedin.com/developers/apps and associate the Skylar company page. Add appropriate Sign In and Community Management products, configure the callback URI, then set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET. OAuth alone does not grant organization analytics; API access may need approval.

### Google Business Profile and GA4
Create/select a project at https://console.cloud.google.com/. Configure OAuth consent and a Web OAuth client. Add the redirect URI above, enable Business Profile APIs and Google Analytics Data API, then set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET. Business Profile API access may require separate approval. The Google account must have access to the target business profile and GA4 property.

## Current limitations
- Facebook/Instagram metrics sync requires granted Meta permissions, an accessible managed Page, and for Instagram a linked Professional account.
- LinkedIn OAuth is implemented, but analytics sync intentionally reports an explicit approval/organization-selection requirement until approved Community Management API access is available.
- Google Business Profile sync enumerates the first accessible account/location and requests monthly website clicks, call clicks, direction requests, messaging clicks and search/maps impressions. It requires Business Profile Business Information and Performance API access plus an eligible location; configure explicit location selection before multi-location use.
- GA4 currently selects the first accessible property. Before production reporting, configure an explicit property ID.
- No metrics are fabricated; a failed/unapproved provider sync returns an error rather than claiming that zero is actual activity.

## Test checklist
- [ ] /api/social?op=config returns only public Supabase config and provider configured booleans.
- [ ] Unauthenticated status/start/sync calls return 401.
- [ ] Non-allowlisted email returns 403.
- [ ] Invalid/expired OAuth state is rejected.
- [ ] Tokens are AES-256-GCM ciphertext in social_connections.token_ciphertext.
- [ ] Each authorized provider returns the connected account label.
- [ ] Sync either imports provider metrics or shows an explicit permission/approval error.
- [ ] Disconnect removes only the selected provider connection.
- [ ] Existing quotation builder, PDF export, Gmail drafts, document list and sales dashboard remain functional.