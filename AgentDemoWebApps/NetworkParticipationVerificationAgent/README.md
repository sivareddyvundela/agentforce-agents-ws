# healthEdge AI — Network Participation Verification (Demo)

A standalone, static, Vercel-deployable pre-sales demo website showcasing the **Network
Participation Verification Agent** — a Salesforce Agentforce **Employee Agent** built for
internal healthcare payer staff. Staff supply a provider's Name and NPI (both are required —
the agent will not search on just one) and the agent returns the provider's specialty,
city/state/country, every network they participate in (with Active/Inactive status and
network tier), and every service location on file. A separate knowledge-search subagent
answers general policy/procedure questions, and dedicated guardrail subagents redirect
off-topic chatter or vague requests instead of guessing.

This site is one of several standalone demo apps in the "healthEdge AI" umbrella suite, each
showcasing a different Agentforce agent.

## What's in this demo

- **index.html** — Marketing/explainer landing page (left panel) + login card (right panel).
- **dashboard.html** — Authenticated app shell with sidebar navigation, mock provider data,
  and a floating chat-launcher stub where the real Agentforce embedded chat will be wired in.
- **assets/css/style.css** — All styling (emerald-green clinical SaaS look, fully responsive).
- **assets/js/data.js** — Mock/demo data (provider profile, network participation, service
  locations, knowledge FAQ). No real PHI/PII — all names and values are fictional.
- **assets/js/app.js** — Login gate logic and dashboard tab-switching logic.
- **vercel.json** — Zero-config static deploy settings.

## Login credentials (demo only)

| Field    | Value         |
|----------|---------------|
| Username | `network.ops` |
| Password | `Demo@123`    |

These are also shown directly on the login page in a "Demo Credentials" hint box.

## Sidebar tabs (dashboard.html)

1. Overview
2. Provider Lookup
3. Network Participation
4. Service Locations
5. Knowledge FAQ

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
  and `sessionStorage.heAI_agent = 'NetworkParticipationVerificationAgent'` before
  redirecting to `dashboard.html`. Wrong credentials show an inline error.
- **Dashboard auth check**: `dashboard.html` immediately checks
  `sessionStorage.heAI_authenticated === 'true'` on load and redirects back to
  `index.html` if the session flag is missing (e.g. direct navigation without logging in).
- **Tab switching**: Sidebar tabs are rendered from the `tabs` array in `data.js` and
  switch the visible content panel via simple show/hide (no page reload, no hash routing).

## Deploy to Vercel

From inside this folder:

```bash
cd NetworkParticipationVerificationAgent
vercel deploy
vercel --prod
```

No build step or configuration is required — this is a plain static HTML/CSS/JS site.
