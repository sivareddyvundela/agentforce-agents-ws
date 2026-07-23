# healthEdge AI — Member Benefits and Eligibility (Demo)

A standalone, static, Vercel-deployable pre-sales demo website showcasing the **Member
Benefits and Eligibility Agent** — a Salesforce Agentforce Service Agent (real bundle
`HealthBridgeMemberQueriesAgent_3`) built for a healthcare payer's member portal. It verifies
a calling/messaging member's identity (Member Name, Date of Birth, Phone Number) and then
answers questions about that member's own plan benefits, coverage, and prior-authorization
requirements, and surfaces recent claims with denial reasons — over both messaging and voice
channels, escalating to a live human agent on request.

This site is one of twelve standalone demo apps in the "healthEdge AI" umbrella suite, each
showcasing a different Agentforce agent.

## What's in this demo

- **index.html** — Marketing/explainer landing page (left panel) + login card (right panel).
- **dashboard.html** — Authenticated app shell with sidebar navigation, mock member data,
  and a floating chat-launcher stub where the real Agentforce embedded chat will be wired in.
- **assets/css/style.css** — All styling (hot pink/magenta clinical SaaS look, fully responsive).
- **assets/js/data.js** — Mock/demo data (member profile, plan benefits, plan benefit items,
  claims history). No real PHI/PII — all names and values are fictional.
- **assets/js/app.js** — Login gate logic and dashboard tab-switching logic.
- **vercel.json** — Zero-config static deploy settings.

## Login credentials (demo only)

| Field    | Value                |
|----------|----------------------|
| Username | `member.portal.user` |
| Password | `Demo@123`           |

These are also shown directly on the login page in a "Demo Credentials" hint box.

## Sidebar tabs (dashboard.html)

1. Overview
2. My Profile
3. Benefits & Coverage
4. Claims History

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
  and `sessionStorage.heAI_agent = 'BenefitsAndEligibilityAgent'` before redirecting to
  `dashboard.html`. Wrong credentials show an inline error.
- **Dashboard auth check**: `dashboard.html` immediately checks
  `sessionStorage.heAI_authenticated === 'true'` on load and redirects back to
  `index.html` if the session flag is missing (e.g. direct navigation without logging in).
- **Tab switching**: Sidebar tabs are rendered from the `tabs` array in `data.js` and
  switch the visible content panel via simple show/hide (no page reload, no hash routing).

## Deploy to Vercel

From inside this folder:

```bash
cd BenefitsAndEligibilityAgent
vercel deploy
vercel --prod
```

No build step or configuration is required — this is a plain static HTML/CSS/JS site.
