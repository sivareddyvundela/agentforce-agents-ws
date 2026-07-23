# healthEdge AI — Provider Search & Profile (Demo)

A standalone, static, Vercel-deployable pre-sales demo website showcasing **Provider Search
Service — Sunny** — a Salesforce Agentforce agent built for a healthcare payer organization.
Sunny lets Provider Relations Representatives, Contact Center Agents, and Network Operations
Specialists search for a provider by Name, NPI, or Tax ID, then drill into that provider's
full profile: credentials, network participation, active contracts, service locations, and
compliance issues — all without leaving the chat. Unlike other agents in the suite, Sunny is
built entirely on declarative Flow actions (no Apex).

This site is one of six standalone demo apps in the "healthEdge AI" umbrella suite, each
showcasing a different Agentforce agent.

## What's in this demo

- **index.html** — Marketing/explainer landing page (left panel) + login card (right panel).
- **dashboard.html** — Authenticated app shell with sidebar navigation, a searchable provider
  directory, mock drill-down data for the selected provider, and a floating chat-launcher
  stub where the real Agentforce embedded chat will be wired in.
- **assets/css/style.css** — All styling (charcoal + gold premium directory look, fully
  responsive).
- **assets/js/data.js** — Mock/demo data: the provider directory plus credentials, network
  participation, active contracts, service locations, and compliance issues, each keyed by
  provider ID. No real PHI/PII — all names and values are fictional.
- **assets/js/app.js** — Login gate logic, dashboard tab-switching logic, the client-side
  Provider Search text filter, and the "selected provider" logic that scopes the other tabs.
- **vercel.json** — Zero-config static deploy settings.

## Login credentials (demo only)

| Field    | Value         |
|----------|---------------|
| Username | `network.ops` |
| Password | `Demo@123`    |

These are also shown directly on the login page in a "Demo Credentials" hint box.

## Sidebar tabs (dashboard.html)

1. Overview
2. Provider Search
3. Credentials
4. Network Participation
5. Active Contracts
6. Service Locations
7. Compliance Issues

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
  and `sessionStorage.heAI_agent = 'ProviderSearchAndProfileLookup'` before redirecting to
  `dashboard.html`. Wrong credentials show an inline error.
- **Dashboard auth check**: `dashboard.html` immediately checks
  `sessionStorage.heAI_authenticated === 'true'` on load and redirects back to
  `index.html` if the session flag is missing (e.g. direct navigation without logging in).
- **Tab switching**: Sidebar tabs are rendered from the `tabs` array in `data.js` and
  switch the visible content panel via simple show/hide (no page reload, no hash routing).
- **Provider Search & selection**: The Provider Search tab renders the full provider
  directory and filters it live (on every keystroke) by Name, NPI, or Tax ID. Clicking
  "View Profile" on a row stores that provider's ID in `localStorage` (so it survives a
  page refresh) and immediately re-renders the Credentials, Network Participation, Active
  Contracts, Service Locations, and Compliance Issues tabs to show that provider's data,
  with a banner at the top of each tab confirming which provider is currently selected.
  If no provider has been selected yet, the first provider in the directory is used by
  default.

## Deploy to Vercel

From inside this folder:

```bash
cd ProviderSearchAndProfileLookup
vercel deploy
vercel --prod
```

No build step or configuration is required — this is a plain static HTML/CSS/JS site.
