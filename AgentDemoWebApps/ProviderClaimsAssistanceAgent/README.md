# healthEdge AI — Provider Claims Assistance (Demo)

A standalone, static, Vercel-deployable pre-sales demo website showcasing the **Provider
Claims Assistance Agent** (bundle label "Claims Issue Agent") — a Salesforce Agentforce
Service Agent built for a healthcare payer's contact center. It takes a Claim Number and
looks up the matching `Provider_Claims__c` record, reporting back the claim's provider,
type, status, key dates, and dollar amounts in plain language — surfacing the Claim Denial
Reason only when the claim's status is Denied. It is strictly read-only: it never creates,
updates, or deletes claim data.

This site is one of several standalone demo apps in the "healthEdge AI" umbrella suite, each
showcasing a different Agentforce agent.

## What's in this demo

- **index.html** — Marketing/explainer landing page (left panel) + login card (right panel).
- **dashboard.html** — Authenticated app shell with sidebar navigation, mock claim data,
  and a floating chat-launcher stub where the real Agentforce embedded chat will be wired in.
- **assets/css/style.css** — All styling (amber/gold clinical SaaS look, fully responsive).
- **assets/js/data.js** — Mock/demo data (overview stats, an example claim lookup result,
  and claim history). No real PHI/PII — all names and values are fictional.
- **assets/js/app.js** — Login gate logic and dashboard tab-switching logic.
- **vercel.json** — Zero-config static deploy settings.

## Login credentials (demo only)

| Field    | Value            |
|----------|------------------|
| Username | `claims.support` |
| Password | `Demo@123`       |

These are also shown directly on the login page in a "Demo Credentials" hint box.

## Sidebar tabs (dashboard.html)

1. Overview
2. Claim Lookup
3. Claim History

## Where to paste the real Agentforce embed script

Open **dashboard.html** and scroll to the bottom, immediately before the closing
`</body>` tag. You'll find a clearly marked placeholder block:

```html
<!-- ============================================================
     AGENTFORCE EMBED SCRIPT
     Paste the Agentforce Agent embedded-service bootstrap script
     here to enable the live chat experience for this demo.
     ============================================================ -->
<!-- <script src="REPLACE_WITH_AGENTFORCE_EMBED_SCRIPT_URL"></script> -->
```

Replace that commented-out line with the real Agentforce embedded-service `<script>` tag
provided by Salesforce. Once added, the live agent will render in place of (or alongside)
the floating chat-launcher stub currently on the page.

## How the demo works

- **Login gate**: `assets/js/app.js` validates the login form client-side (required
  fields), checks the entered username/password against the demo credentials in
  `assets/js/data.js`, and on success sets `sessionStorage.heAI_authenticated = 'true'`
  and `sessionStorage.heAI_agent = 'ProviderClaimsAssistanceAgent'` before redirecting to
  `dashboard.html`. Wrong credentials show an inline error.
- **Dashboard auth check**: `dashboard.html` immediately checks
  `sessionStorage.heAI_authenticated === 'true'` on load and redirects back to
  `index.html` if the session flag is missing (e.g. direct navigation without logging in).
- **Tab switching**: Sidebar tabs are rendered from the `tabs` array in `data.js` and
  switch the visible content panel via simple show/hide (no page reload, no hash routing).
- **Claim Lookup rendering**: The Claim Lookup tab renders the `currentClaim` object from
  `data.js` as a profile-style card. The Claim Denial Reason field is only appended to the
  card when the claim's `status` is `"Denied"`, mirroring the real agent's flow logic.
- **Claim History table**: The Claim History tab renders the `claimHistory` array from
  `data.js` as a table, with each row's status rendered as a color-coded status pill
  (Denied = red, Paid/Approved = green, Submitted/Under Review = amber, Closed = neutral).

## Deploy to Vercel

From inside this folder:

```bash
cd ProviderClaimsAssistanceAgent && vercel deploy && vercel --prod
```

No build step or configuration is required — this is a plain static HTML/CSS/JS site.
