# healthEdge AI — Provider Issue Management (Demo)

A standalone, static, Vercel-deployable pre-sales demo website showcasing the **Provider
Issue Management Agent** — a Salesforce Agentforce Service Agent built for a healthcare
payer's provider-facing contact center. It identifies a calling provider by Name and NPI,
classifies their free-text issue into one of six categories (Claims Issue, Payment Inquiry,
Credentialing Issue, Contract Issue, Directory Issue, or Unknown) with a confidence score,
pulls the relevant record data, and recommends a resolution path — escalating to a live
agent (the Escalation Team queue) whenever confidence is low or the provider asks for one.

This site is one of several standalone demo apps in the "healthEdge AI" umbrella suite, each
showcasing a different Agentforce agent.

## What's in this demo

- **index.html** — Marketing/explainer landing page (left panel) + login card (right panel).
- **dashboard.html** — Authenticated app shell with sidebar navigation, mock triage data,
  and a floating chat-launcher stub where the real Agentforce embedded chat will be wired in.
- **assets/css/style.css** — All styling (royal/steel blue clinical SaaS look, fully responsive).
- **assets/js/data.js** — Mock/demo data (provider profile, example issue classification,
  example resolution recommendation, recent cases). No real PHI/PII — all names and values
  are fictional.
- **assets/js/app.js** — Login gate logic and dashboard tab-switching logic.
- **vercel.json** — Zero-config static deploy settings.

## Login credentials (demo only)

| Field    | Value         |
|----------|---------------|
| Username | `support.rep` |
| Password | `Demo@123`    |

These are also shown directly on the login page in a "Demo Credentials" hint box.

## Sidebar tabs (dashboard.html)

1. Overview
2. Provider Profile
3. Issue Classification
4. Resolution Recommendation
5. Recent Cases

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
  and `sessionStorage.heAI_agent = 'ProviderIssueManagementAgent'` before redirecting to
  `dashboard.html`. Wrong credentials show an inline error.
- **Dashboard auth check**: `dashboard.html` immediately checks
  `sessionStorage.heAI_authenticated === 'true'` on load and redirects back to
  `index.html` if the session flag is missing (e.g. direct navigation without logging in).
- **Tab switching**: Sidebar tabs are rendered from the `tabs` array in `data.js` and
  switch the visible content panel via simple show/hide (no page reload, no hash routing).
- **Issue-type and recommended-action pills**: `app.js` maps each issue type (Claims,
  Payment, Credentialing, Contract, Directory, Unknown) to its own pill color, and maps
  each recommended action to a tone — Provide Status Update (positive), Request Additional
  Information (warning), Escalate to Support Queue / No Action Available (danger) — so the
  Recent Cases table and the classification/recommendation cards read at a glance.

## Deploy to Vercel

From inside this folder:

```bash
cd ProviderIssueManagementAgent
vercel deploy
vercel --prod
```

No build step or configuration is required — this is a plain static HTML/CSS/JS site.
