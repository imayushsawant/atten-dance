# SEO and authentication verification

Run `npm ci && npm test && npm run build && npm run test:seo`.

Production smoke checks (use a Vercel preview before merging):
- Visit / in a new private browser: landing page visible immediately, no blocking session request.
- Visit / with a valid session cookie: temporary redirect to /dashboard, no landing flash.
- Visit / with a stale cookie: dashboard validates then routes to login; no loop.
- Visit /dashboard without a cookie: no private content; login redirect.
- Sign in using email and Google; sign out and repeat the guest test.
- Simulate an unavailable authentication API: retry message, no private data.
- Inspect the cache cookie and confirm that a valid cached session avoids repeated DB reads; verify expiry and revocation behavior (60-second maximum cache window).
- Verify /robots.txt is text, /sitemap.xml is XML, all four calculator URLs return HTML, and unknown routes return 404.
- Confirm canonical host and OAuth callback configuration in Vercel and Google before redirecting other domains.

The public calculator counts sessions equally; the signed-in tracker supports separate lecture/lab rules. No private data is prerendered.
